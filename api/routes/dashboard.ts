import { Router } from 'express';
import { getAdminDashboardSummaryController, getMemberDashboardSummaryController } from '../controllers/dashboard.controller.js';
import { authorize } from '../middlewares/authorize.js';

const dashboardRouter = Router();

dashboardRouter.get('/', authorize('ADMIN'), getAdminDashboardSummaryController);
dashboardRouter.get('/me', authorize('MEMBER'), getMemberDashboardSummaryController);

export default dashboardRouter;
