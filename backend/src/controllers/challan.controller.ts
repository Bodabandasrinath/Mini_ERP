import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthenticatedRequest, ChallanStatus, MovementType } from '../types';
import { generateChallanNumber } from '../utils/challanNumber';
import { Prisma } from '@prisma/client';

export const getChallans = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string || '').trim();
    const status = req.query.status as ChallanStatus;
    const customerId = req.query.customerId as string;

    const where: Prisma.ChallanWhereInput = {};

    if (search) {
      where.OR = [
        { challanNumber: { contains: search } },
        { customer: { customerName: { contains: search } } },
        { customer: { businessName: { contains: search } } },
      ];
    }

    if (status && Object.values(ChallanStatus).includes(status)) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [total, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, customerName: true, businessName: true, mobileNumber: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          items: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(
      res,
      challans,
      'Challans fetched successfully',
      200,
      { page, limit, total, totalPages }
    );
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, currentStock: true, warehouseLocation: true } },
          },
        },
      },
    });

    if (!challan) {
      throw new NotFoundError(`Challan with ID ${id} not found`);
    }

    return sendSuccess(res, challan, 'Challan details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { customerId, items } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }

    // Fetch product details for snapshot
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestError('One or more requested products do not exist');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    const challanItemsData = items.map((item: { productId: string; quantity: number }) => {
      const p = productMap.get(item.productId)!;
      totalQuantity += item.quantity;
      return {
        productId: p.id,
        productNameSnapshot: p.productName,
        skuSnapshot: p.sku,
        unitPriceSnapshot: p.unitPrice,
        quantity: item.quantity,
        totalPrice: p.unitPrice * item.quantity,
      };
    });

    const challanNumber = await generateChallanNumber();

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdById: userId,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return sendSuccess(res, challan, 'Sales Challan created as DRAFT successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw new NotFoundError(`Challan with ID ${id} not found`);
    }

    if (existing.status !== ChallanStatus.DRAFT) {
      throw new BadRequestError(`Cannot edit a challan with status '${existing.status}'`);
    }

    const { customerId, items } = req.body;

    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundError(`Customer with ID ${customerId} not found`);
      }
    }

    let totalQuantity = existing.totalQuantity;

    let itemsUpdateOp = {};
    if (items) {
      const productIds = items.map((item: { productId: string }) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestError('One or more requested products do not exist');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      totalQuantity = 0;

      const newItemsData = items.map((item: { productId: string; quantity: number }) => {
        const p = productMap.get(item.productId)!;
        totalQuantity += item.quantity;
        return {
          productId: p.id,
          productNameSnapshot: p.productName,
          skuSnapshot: p.sku,
          unitPriceSnapshot: p.unitPrice,
          quantity: item.quantity,
          totalPrice: p.unitPrice * item.quantity,
        };
      });

      itemsUpdateOp = {
        deleteMany: {},
        create: newItemsData,
      };
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: {
        ...(customerId && { customerId }),
        totalQuantity,
        items: itemsUpdateOp,
      },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return sendSuccess(res, updated, 'Challan updated successfully');
  } catch (error) {
    next(error);
  }
};

export const confirmChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Transaction-safe Challan confirmation
    const confirmedChallan = await prisma.$transaction(async (tx) => {
      // 1. Fetch Challan with items
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw new NotFoundError(`Challan with ID ${id} not found`);
      }

      // 2. Verify status is DRAFT
      if (challan.status !== ChallanStatus.DRAFT) {
        throw new BadRequestError(`Challan is already in status '${challan.status}'`);
      }

      // 3. Lock & verify stock for ALL products inside transaction
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestError(
            `Product '${item.productNameSnapshot}' (SKU: ${item.skuSnapshot}) no longer exists`
          );
        }

        if (product.currentStock < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for ${product.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}`
          );
        }
      }

      // 4. Reduce stock & record OUT movements for EVERY item
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantityChanged: item.quantity,
            movementType: MovementType.OUT,
            reason: `Challan Fulfillment #${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }

      // 5. Update Challan status to CONFIRMED
      const updated = await tx.challan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
        },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, email: true } },
          items: true,
        },
      });

      return updated;
    });

    return sendSuccess(res, confirmedChallan, 'Sales Challan confirmed and inventory updated');
  } catch (error) {
    next(error);
  }
};

export const cancelChallan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const challan = await prisma.challan.findUnique({ where: { id } });
    if (!challan) {
      throw new NotFoundError(`Challan with ID ${id} not found`);
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      throw new BadRequestError(
        `Only DRAFT challans can be cancelled. Current status is '${challan.status}'`
      );
    }

    const cancelled = await prisma.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return sendSuccess(res, cancelled, 'Challan cancelled successfully');
  } catch (error) {
    next(error);
  }
};
