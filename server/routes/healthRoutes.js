import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API crédit en ligne opérationnelle' });
});

export default router;