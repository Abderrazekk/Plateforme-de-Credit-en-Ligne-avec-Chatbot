import express from 'express';
import { serveDocument } from '../controllers/documentController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.get('/:filename', protect, serveDocument);

export default router;