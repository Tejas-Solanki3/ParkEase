import express from 'express';
import {
  processPayment,
  getPaymentById,
  getUserPayments
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, processPayment);
router.get('/:id', protect, getPaymentById);
router.get('/user/:userId', protect, getUserPayments);

export default router;
