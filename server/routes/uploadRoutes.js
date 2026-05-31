import express from 'express';
import { uploadDocument } from '../controllers/uploadController.js';
import protect from '../middlewares/auth.js';
import authorize from '../middlewares/roleCheck.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/document',
  protect,
  authorize('client', 'admin'),
  upload.single('document'),
  uploadDocument
);

export default router;