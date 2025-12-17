import express from 'express';
import {
  getParkingLots,
  getParkingLotById,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot
} from '../controllers/parkingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getParkingLots)
  .post(protect, admin, createParkingLot);

router.route('/:id')
  .get(getParkingLotById)
  .put(protect, admin, updateParkingLot)
  .delete(protect, admin, deleteParkingLot);

export default router;
