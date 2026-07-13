import { Router } from 'express';
import { createBorrowRecordController, listBorrowRecordsController, returnBorrowRecordController } from '../controllers/borrow.controller.js';
import { validate } from '../middlewares/validate.js';
import { borrowRecordIdParamsSchema, createBorrowRecordSchema, listBorrowRecordsQuerySchema } from '../schemas/borrow.schema.js';

const borrowRecordsRouter = Router();

borrowRecordsRouter.get('/', validate({ query: listBorrowRecordsQuerySchema }), listBorrowRecordsController);
borrowRecordsRouter.post('/', validate({ body: createBorrowRecordSchema }), createBorrowRecordController);
borrowRecordsRouter.post('/:id/return', validate({ params: borrowRecordIdParamsSchema }), returnBorrowRecordController);

export default borrowRecordsRouter;
