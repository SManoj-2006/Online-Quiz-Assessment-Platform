import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [v => v.length >= 2, 'A question must have at least 2 options']
  },
  correctAnswer: {
    type: Number, // Index of the correct option (0-based)
    required: true
  },
  points: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;
