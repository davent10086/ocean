import { Router } from 'express';
import { createBookController, deleteBookController, listBooksController, updateBookController } from '../controllers/book.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { bookIdParamsSchema, listBooksQuerySchema, saveBookSchema } from '../schemas/book.schema.js';

const booksRouter = Router();

booksRouter.get('/', validate({ query: listBooksQuerySchema }), listBooksController);
booksRouter.post('/', authorize('ADMIN'), validate({ body: saveBookSchema }), createBookController);
booksRouter.put('/:id', authorize('ADMIN'), validate({ params: bookIdParamsSchema, body: saveBookSchema }), updateBookController);
booksRouter.delete('/:id', authorize('ADMIN'), validate({ params: bookIdParamsSchema }), deleteBookController);

export default booksRouter;
