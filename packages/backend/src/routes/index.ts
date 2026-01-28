import { Router } from 'express';
import multer from 'multer';
import * as itemController from '../controllers/item.controller';
import * as transactionController from '../controllers/transaction.controller';
import * as uploadController from '../controllers/upload.controller';
import * as categoryController from '../controllers/transaction-categories.controller';

import { ApiResponseHelper } from '../utils/apiResponse';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../middleware/require-admin';
import * as securityStatsController from '../controllers/security-stats.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health Check
router.get('/health', (req, res) => {
    res.json(ApiResponseHelper.success({
        status: 'ok',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    }, 'API is healthy'));
});

// Protected Routes
router.use(protect);

// Items
router.get('/item-types', itemController.getItemTypes);
router.get('/items', itemController.listItems);
router.post('/items', itemController.createItem);
router.put('/items/:id', itemController.updateItem);
router.delete('/items/:id', itemController.deleteItem);

// Transaction Categories
router.get('/transaction-categories', categoryController.getCategories);
router.get('/transaction-categories/:id', categoryController.getCategory);
router.post('/transaction-categories', categoryController.createCategory);
router.put('/transaction-categories/:id', categoryController.updateCategory);
router.delete('/transaction-categories/:id', categoryController.deleteCategory);

// Transactions
router.get('/transactions', transactionController.listTransactions);
router.post('/transactions', transactionController.createTransaction);
router.put('/transactions/:id', transactionController.updateTransaction);
router.get('/transactions/stats', transactionController.getStats);

// Upload
router.post('/upload', upload.single('file'), uploadController.uploadFile);
router.put('/upload/:id/finalize', uploadController.finalizeUpload);
router.get('/excel-uploads', uploadController.listProcessedUploads);
router.get('/excel-uploads/:id', uploadController.getUploadDetails);

// Analytics
import analyticsRoutes from './analytics.routes';
router.use('/analytics', analyticsRoutes);

// Organizations (Multi-Tenant)
import organizationsRoutes from './organizations';
router.use('/organizations', organizationsRoutes);

// Admin - Security Stats (protected by requireAdmin)
router.get('/admin/security-stats', requireAdmin, securityStatsController.getSecurityStats);

export default router;

