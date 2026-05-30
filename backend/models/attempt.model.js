import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [
    {
      questionId: {
        type: String,
        required: true
      },
      selectedOption: {
        type: Number // Index of selected option, or null if skipped
      }
    }
  ],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswersCount: {
    type: Number,
    required: true
  },
  wrongAnswersCount: {
    type: Number,
    required: true
  },
  skippedAnswersCount: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Attempt = mongoose.models.Attempt || mongoose.model('Attempt', attemptSchema);
export default Attempt;
