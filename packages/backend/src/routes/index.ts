import { Router } from 'express';
import multer from 'multer';
import * as itemController from '../controllers/item.controller';
import * as transactionController from '../controllers/transaction.controller';
import * as uploadController from '../controllers/upload.controller';

import { ApiResponseHelper } from '../utils/apiResponse';

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

// Items
router.get('/items', itemController.listItems);
router.post('/items', itemController.createItem);
router.put('/items/:id', itemController.updateItem);
router.delete('/items/:id', itemController.deleteItem);

// Transactions
router.get('/transactions', transactionController.listTransactions);
router.post('/transactions', transactionController.createTransaction);
router.put('/transactions/:id', transactionController.updateTransaction);
router.get('/transactions/stats', transactionController.getStats);

// Upload
router.post('/upload', upload.single('file'), uploadController.uploadFile);

export default router;
