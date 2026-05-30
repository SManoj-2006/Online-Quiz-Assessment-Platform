import express from 'express';
import { getLeaderboard, getAdminStats, getUserDashboard, getAttemptDetails } from '../controllers/analytics.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/leaderboard', protect, getLeaderboard);
router.get('/admin', protect, admin, getAdminStats);
router.get('/student', protect, getUserDashboard);
router.get('/attempts/:id', protect, getAttemptDetails);

export default router;
