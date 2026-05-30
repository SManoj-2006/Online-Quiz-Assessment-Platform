import express from 'express';
import multer from 'multer';
import { 
  createQuiz, 
  getAllQuizzes, 
  getQuizById, 
  updateQuiz, 
  deleteQuiz, 
  getQuizQuestions, 
  addQuestions, 
  bulkUploadQuestions, 
  submitAttempt 
} from '../controllers/quiz.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer settings for memory buffer storage file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.route('/')
  .post(protect, admin, createQuiz)
  .get(protect, getAllQuizzes);

router.route('/:id')
  .get(protect, getQuizById)
  .put(protect, admin, updateQuiz)
  .delete(protect, admin, deleteQuiz);

router.route('/:id/questions')
  .get(protect, getQuizQuestions)
  .post(protect, admin, addQuestions);

router.post('/:id/upload', protect, admin, upload.single('file'), bulkUploadQuestions);
router.post('/:id/submit', protect, submitAttempt);

export default router;
