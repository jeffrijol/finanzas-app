import { Router } from 'express';
import { upload } from '../middleware/upload';
import { uploadFile, finalizeUpload } from '../controllers/upload.controller';

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);
router.put('/upload/:id/finalize', finalizeUpload);

export const uploadRoutes = router;
