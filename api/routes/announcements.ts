import { Router } from 'express';
import {
  createAnnouncementController,
  deleteAnnouncementController,
  getLatestAnnouncementsController,
  listAnnouncementsController,
  updateAnnouncementController,
} from '../controllers/announcement.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  announcementIdParamsSchema,
  listAnnouncementsQuerySchema,
  saveAnnouncementSchema,
} from '../schemas/announcement.schema.js';

const announcementsRouter = Router();

announcementsRouter.get('/latest', getLatestAnnouncementsController);
announcementsRouter.get('/', validate({ query: listAnnouncementsQuerySchema }), listAnnouncementsController);
announcementsRouter.post('/', authorize('ADMIN'), validate({ body: saveAnnouncementSchema }), createAnnouncementController);
announcementsRouter.put('/:id', authorize('ADMIN'), validate({ params: announcementIdParamsSchema, body: saveAnnouncementSchema }), updateAnnouncementController);
announcementsRouter.delete('/:id', authorize('ADMIN'), validate({ params: announcementIdParamsSchema }), deleteAnnouncementController);

export default announcementsRouter;
