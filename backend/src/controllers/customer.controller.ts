import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { AuthenticatedRequest, CustomerType, CustomerStatus } from '../types';
import { Prisma } from '@prisma/client';

export const getCustomers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const search = (req.query.search as string || '').trim();
    const type = req.query.type as CustomerType;
    const status = req.query.status as CustomerStatus;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { mobileNumber: { contains: search } },
        { businessName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (type && Object.values(CustomerType).includes(type)) {
      where.customerType = type;
    }

    if (status && Object.values(CustomerStatus).includes(status)) {
      where.status = status;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { followUps: true, challans: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(
      res,
      customers,
      'Customers fetched successfully',
      200,
      { page, limit, total, totalPages }
    );
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        followUps: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, name: true } } },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            challanNumber: true,
            totalQuantity: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    return sendSuccess(res, customer, 'Customer details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const {
      customerName,
      mobileNumber,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const customer = await prisma.customer.create({
      data: {
        customerName,
        mobileNumber,
        email: email || null,
        businessName,
        gstNumber: gstNumber || null,
        customerType,
        address,
        status,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, customer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await prisma.customer.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    const {
      customerName,
      mobileNumber,
      email,
      businessName,
      gstNumber,
      customerType,
      address,
      status,
      followUpDate,
      notes,
    } = req.body;

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(mobileNumber !== undefined && { mobileNumber }),
        ...(email !== undefined && { email: email || null }),
        ...(businessName !== undefined && { businessName }),
        ...(gstNumber !== undefined && { gstNumber: gstNumber || null }),
        ...(customerType !== undefined && { customerType }),
        ...(address !== undefined && { address }),
        ...(status !== undefined && { status }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, updated, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { challans: true } } },
    });

    if (!existing) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    if (existing._count.challans > 0) {
      throw new BadRequestError(
        `Cannot delete customer with ${existing._count.challans} associated sales challan(s)`
      );
    }

    await prisma.customer.delete({ where: { id } });
    return sendSuccess(res, { id }, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const createFollowup = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: customerId } = req.params;
    const userId = req.user!.id;
    const { note, followUpDate } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }

    const parsedDate = new Date(followUpDate);

    // Create followup and update customer's latest followUpDate
    const [followup] = await prisma.$transaction([
      prisma.customerFollowup.create({
        data: {
          customerId,
          note,
          followUpDate: parsedDate,
          createdById: userId,
        },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: { followUpDate: parsedDate },
      }),
    ]);

    return sendSuccess(res, followup, 'Follow-up recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getFollowups = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: customerId } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${customerId} not found`);
    }

    const followups = await prisma.customerFollowup.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, followups, 'Follow-ups fetched successfully');
  } catch (error) {
    next(error);
  }
};
