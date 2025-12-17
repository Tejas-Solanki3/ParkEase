import express from 'express';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  extendBooking,
  cancelBooking,
  getBookingById
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getAllBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/user/:id')
  .get(protect, getUserBookings);

router.route('/:id/extend')
  .put(protect, extendBooking);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

export default router;
