import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthenticatedRequest, MovementType } from '../types';
import { Prisma } from '@prisma/client';

export const getStockMovements = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const productId = req.query.productId as string;
    const movementType = req.query.movementType as MovementType;

    const where: Prisma.StockMovementWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (movementType && Object.values(MovementType).includes(movementType)) {
      where.movementType = movementType;
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, productName: true, sku: true, currentStock: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(
      res,
      movements,
      'Stock movements fetched successfully',
      200,
      { page, limit, total, totalPages }
    );
  } catch (error) {
    next(error);
  }
};

export const getStockMovementsByProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: productId } = req.params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, movements, `Stock movements for product '${product.productName}' fetched successfully`);
  } catch (error) {
    next(error);
  }
};

export const createStockMovement = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { productId, quantityChanged, movementType, reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });

      if (!product) {
        throw new NotFoundError(`Product with ID ${productId} not found`);
      }

      let newStock = product.currentStock;

      if (movementType === MovementType.IN) {
        newStock += quantityChanged;
      } else if (movementType === MovementType.OUT) {
        if (product.currentStock < quantityChanged) {
          throw new BadRequestError('Insufficient stock');
        }
        newStock -= quantityChanged;
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantityChanged,
          movementType,
          reason,
          createdById: userId,
        },
        include: {
          product: { select: { id: true, productName: true, sku: true, currentStock: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      return { movement, currentStock: updatedProduct.currentStock };
    });

    return sendSuccess(res, result.movement, 'Stock movement recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};
