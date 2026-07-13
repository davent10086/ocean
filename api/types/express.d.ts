import type { AuthUser } from '../../shared/types.js';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
