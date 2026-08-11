import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest, CustomerStatus, ChallanStatus } from '../types';

export const getDashboardStats = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      allProducts,
      totalChallans,
      confirmedChallans,
      draftChallans,
      recentCustomers,
      recentMovements,
      recentChallans,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.product.count(),
      prisma.product.findMany({
        select: {
          id: true,
          productName: true,
          sku: true,
          category: true,
          currentStock: true,
          minimumStockAlertQuantity: true,
          warehouseLocation: true,
        },
      }),
      prisma.challan.count(),
      prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          businessName: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { productName: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { customerName: true, businessName: true } },
        },
      }),
    ]);

    const lowStockProducts = allProducts.filter(
      (p) => p.currentStock <= p.minimumStockAlertQuantity
    );

    const stats = {
      kpi: {
        totalCustomers,
        activeCustomers,
        totalProducts,
        lowStockProductsCount: lowStockProducts.length,
        totalChallans,
        confirmedChallans,
        draftChallans,
      },
      lowStockAlerts: lowStockProducts,
      recentActivity: {
        customers: recentCustomers,
        movements: recentMovements,
        challans: recentChallans,
      },
    };

    return sendSuccess(res, stats, 'Dashboard statistics fetched successfully');
  } catch (error) {
    next(error);
  }
};
