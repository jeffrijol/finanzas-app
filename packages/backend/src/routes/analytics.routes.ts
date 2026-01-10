import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

// General Stats (mimics current /stats but cleaner)
router.get('/general', AnalyticsController.getGeneralStats);

// Specific Drill-downs
router.get('/type/:typeId', AnalyticsController.getTypeStats);
router.get('/item/:itemId', AnalyticsController.getItemStats);
router.get('/category/:categoryId', AnalyticsController.getCategoryStats);

export default router;


