import { Router } from 'express';
import {
  createUserController,
  deleteUserController,
  listUsersController,
  resetUserPasswordController,
  updateUserController,
  updateUserStatusController,
} from '../controllers/user.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  createUserSchema,
  listUsersQuerySchema,
  resetPasswordSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from '../schemas/user.schema.js';

const usersRouter = Router();

usersRouter.use(authorize('ADMIN'));
usersRouter.get('/', validate({ query: listUsersQuerySchema }), listUsersController);
usersRouter.post('/', validate({ body: createUserSchema }), createUserController);
usersRouter.put('/:id', validate({ params: userIdParamsSchema, body: updateUserSchema }), updateUserController);
usersRouter.patch('/:id/password', validate({ params: userIdParamsSchema, body: resetPasswordSchema }), resetUserPasswordController);
usersRouter.patch('/:id/status', validate({ params: userIdParamsSchema, body: updateUserStatusSchema }), updateUserStatusController);
usersRouter.delete('/:id', validate({ params: userIdParamsSchema }), deleteUserController);

export default usersRouter;
