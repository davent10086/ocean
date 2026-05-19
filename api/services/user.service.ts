import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export const listUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

export const createUser = async (input: {
  email: string;
  password: string;
  role: 'ADMIN' | 'MEMBER';
}) => {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError('该邮箱已存在，请更换后再试。', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role: input.role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};
