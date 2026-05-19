import { Router } from 'express';
import { loginController, registerController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';

const authRouter = Router();

authRouter.post('/login', validate({ body: loginSchema }), loginController);
authRouter.post('/register', validate({ body: registerSchema }), registerController);

export default authRouter;
