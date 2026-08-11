import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { sendSuccess } from '../utils/response';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role: role || 'SALES',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return sendSuccess(
      res,
      user,
      'User account registered successfully! You can now sign in.',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: config.jwtExpiresIn as any,
    };

    const token = jwt.sign(payload, config.jwtSecret, options);

    return sendSuccess(
      res,
      {
        user: payload,
        token,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return sendSuccess(res, user, 'User profile fetched successfully');
  } catch (error) {
    next(error);
  }
};
