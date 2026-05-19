import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { createUser } from './user.service.js';

const buildAuthResult = (user: { id: number; email: string; role: 'ADMIN' | 'MEMBER' }) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('邮箱或密码不正确。', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('邮箱或密码不正确。', 401);
  }

  return buildAuthResult(user);
};

export const register = async (email: string, password: string) => {
  const user = await createUser({
    email,
    password,
    role: 'MEMBER',
  });

  return buildAuthResult(user);
};
