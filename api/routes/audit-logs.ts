import { Router } from 'express';
import { listAuditLogsController } from '../controllers/audit-log.controller.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { listAuditLogsQuerySchema } from '../schemas/audit-log.schema.js';

const auditLogRouter = Router();

auditLogRouter.get('/', authorize('ADMIN'), validate({ query: listAuditLogsQuerySchema }), listAuditLogsController);

export default auditLogRouter;