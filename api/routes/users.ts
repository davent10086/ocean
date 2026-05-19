import { Router } from 'express';
import { createUserController, listUsersController } from '../controllers/user.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema } from '../schemas/user.schema.js';

const usersRouter = Router();

usersRouter.use(authorize('ADMIN'));
usersRouter.get('/', listUsersController);
usersRouter.post('/', validate({ body: createUserSchema }), createUserController);

export default usersRouter;
