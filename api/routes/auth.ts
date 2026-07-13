import { Router, type NextFunction, type Request, type Response } from 'express';
import { loginController, registerController } from '../controllers/auth.controller.js';
import { AppError } from '../utils/app-error.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const authRouter = Router();

// 简单的内存速率限制：每 IP 登录/注册限制 10 次/分钟，避免暴力破解
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const authRateLimiter = (req: Request, _res: Response, next: NextFunction) => {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  record.count += 1;
  if (record.count > RATE_LIMIT_MAX) {
    next(new AppError('请求过于频繁，请稍后再试。', 429));
    return;
  }

  next();
};

authRouter.use(authRateLimiter);
authRouter.post('/login', validate({ body: loginSchema }), loginController);
authRouter.post('/register', validate({ body: registerSchema }), registerController);

export default authRouter;
