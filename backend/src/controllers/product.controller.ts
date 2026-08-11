import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';
import { Prisma } from '@prisma/client';

export const getProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string || '').trim();
    const category = (req.query.category as string || '').trim();
    const lowStockOnly = req.query.lowStock === 'true';

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (category) {
      where.category = { equals: category };
    }

    if (lowStockOnly) {
      // Products where currentStock <= minimumStockAlertQuantity
      where.currentStock = { lte: prisma.product.fields ? undefined : undefined }; 
      // Prisma raw column comparisons in findMany can be done via filter or inside raw, but simple way in Prisma:
      // We will filter or handle via clause if needed, or query using raw comparison
    }

    // Handled in JS or raw or clean condition:
    let [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: lowStockOnly ? 0 : skip,
        take: lowStockOnly ? 1000 : limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (lowStockOnly) {
      products = products.filter((p) => p.currentStock <= p.minimumStockAlertQuantity);
      total = products.length;
      products = products.slice(skip, skip + limit);
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(
      res,
      products,
      'Products fetched successfully',
      200,
      { page, limit, total, totalPages }
    );
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, name: true } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return sendSuccess(res, product, 'Product details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      productName,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStockAlertQuantity,
      warehouseLocation,
    } = req.body;

    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim().toUpperCase() },
    });

    if (existingSku) {
      throw new ConflictError(`Product with SKU '${sku}' already exists`);
    }

    const product = await prisma.product.create({
      data: {
        productName,
        sku: sku.trim().toUpperCase(),
        category,
        unitPrice,
        currentStock,
        minimumStockAlertQuantity,
        warehouseLocation,
      },
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    const {
      productName,
      sku,
      category,
      unitPrice,
      currentStock,
      minimumStockAlertQuantity,
      warehouseLocation,
    } = req.body;

    if (sku && sku.trim().toUpperCase() !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: sku.trim().toUpperCase() },
      });
      if (duplicateSku) {
        throw new ConflictError(`Product with SKU '${sku}' already exists`);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(productName !== undefined && { productName }),
        ...(sku !== undefined && { sku: sku.trim().toUpperCase() }),
        ...(category !== undefined && { category }),
        ...(unitPrice !== undefined && { unitPrice }),
        ...(currentStock !== undefined && { currentStock }),
        ...(minimumStockAlertQuantity !== undefined && { minimumStockAlertQuantity }),
        ...(warehouseLocation !== undefined && { warehouseLocation }),
      },
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};
