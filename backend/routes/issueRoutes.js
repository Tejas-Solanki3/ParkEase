import express from 'express';
import {
  createIssue,
  getAllIssues,
  getUserIssues,
  resolveIssue
} from '../controllers/issueController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createIssue)
  .get(protect, admin, getAllIssues);

router.get('/user/:userId', protect, getUserIssues);
router.put('/:id/resolve', protect, admin, resolveIssue);

export default router;
