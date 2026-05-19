import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/blue_ocean_library'),
  DEEPSEEK_API_KEY: z.string().min(1).default('sk-mock'),
  JWT_SECRET: z.string().min(8).default('blue-ocean-library-dev-secret'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  BORROW_LIMIT: z.coerce.number().min(1).default(5),
  BORROW_DAYS: z.coerce.number().min(1).default(14)
});

export const env = envSchema.parse(process.env);
