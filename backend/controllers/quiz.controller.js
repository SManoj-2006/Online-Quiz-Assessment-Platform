import { QuizModel, QuestionModel, AttemptModel } from '../models/index.js';

// ==========================================
// QUIZ CRUD CONTROLLERS
// ==========================================

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private/Admin
export const createQuiz = async (req, res) => {
  const { title, description, timeLimit, negativeMarking, difficulty } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Quiz title is required' });
    }

    const quiz = await QuizModel.create({
      title,
      description,
      timeLimit: Number(timeLimit) || 10,
      negativeMarking: Number(negativeMarking) || 0,
      difficulty: difficulty || 'medium',
      createdBy: req.user._id
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Quiz Creation Error:', error);
    res.status(500).json({ message: 'Server error creating quiz' });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizModel.find({});
    
    // For each quiz, append question count
    const quizzesWithCount = [];
    for (const quiz of quizzes) {
      const questions = await QuestionModel.find({ quizId: quiz._id });
      quizzesWithCount.push({
        ...quiz,
        questionCount: questions.length
      });
    }
    
    res.json(quizzesWithCount);
  } catch (error) {
    console.error('Get Quizzes Error:', error);
    res.status(500).json({ message: 'Server error retrieving quizzes' });
  }
};

// @desc    Get a single quiz details
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
  try {
    const quiz = await QuizModel.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const questions = await QuestionModel.find({ quizId: quiz._id });
    res.json({
      ...quiz,
      questionCount: questions.length
    });
  } catch (error) {
    console.error('Get Quiz Error:', error);
    res.status(500).json({ message: 'Server error retrieving quiz' });
  }
};

// @desc    Update quiz settings
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
export const updateQuiz = async (req, res) => {
  const { title, description, timeLimit, negativeMarking, difficulty } = req.body;

  try {
    const quiz = await QuizModel.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const updatedQuiz = await QuizModel.findByIdAndUpdate(req.params.id, {
      title: title || quiz.title,
      description: description !== undefined ? description : quiz.description,
      timeLimit: timeLimit !== undefined ? Number(timeLimit) : quiz.timeLimit,
      negativeMarking: negativeMarking !== undefined ? Number(negativeMarking) : quiz.negativeMarking,
      difficulty: difficulty || quiz.difficulty
    });

    res.json(updatedQuiz);
  } catch (error) {
    console.error('Update Quiz Error:', error);
    res.status(500).json({ message: 'Server error updating quiz' });
  }
};

// @desc    Delete quiz and associated questions
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await QuizModel.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await QuizModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz and all associated questions deleted successfully' });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    res.status(500).json({ message: 'Server error deleting quiz' });
  }
};

// ==========================================
// QUESTION CONTROLLERS
// ==========================================

// @desc    Get questions for a quiz
// @route   GET /api/quizzes/:id/questions
// @access  Private
export const getQuizQuestions = async (req, res) => {
  try {
    const quiz = await QuizModel.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let questions = await QuestionModel.find({ quizId: req.params.id });

    // SECURITY / ANTI-CHEAT: Strip correctAnswer field if request is from a student
    if (req.user.role !== 'admin') {
      questions = questions.map(q => {
        const { correctAnswer, ...safeQuestion } = q;
        return safeQuestion;
      });
    }

    res.json(questions);
  } catch (error) {
    console.error('Get Questions Error:', error);
    res.status(500).json({ message: 'Server error retrieving questions' });
  }
};

// @desc    Add manual questions to a quiz
// @route   POST /api/quizzes/:id/questions
// @access  Private/Admin
export const addQuestions = async (req, res) => {
  const { questions } = req.body; // Can be a single question object or an array of questions

  try {
    const quiz = await QuizModel.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let formattedQuestions;
    if (Array.isArray(questions)) {
      formattedQuestions = questions.map(q => ({
        ...q,
        quizId: req.params.id,
        correctAnswer: Number(q.correctAnswer),
        points: Number(q.points) || 1
      }));
    } else {
      formattedQuestions = {
        ...questions,
        quizId: req.params.id,
        correctAnswer: Number(questions.correctAnswer),
        points: Number(questions.points) || 1
      };
    }

    const saved = await QuestionModel.create(formattedQuestions);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Add Questions Error:', error);
    res.status(500).json({ message: 'Server error adding questions' });
  }
};

// ==========================================
// BULK UPLOAD QUESTIONS
// ==========================================

// @desc    Bulk upload questions via file or pasted text
// @route   POST /api/quizzes/:id/upload
// @access  Private/Admin
export const bulkUploadQuestions = async (req, res) => {
  const quizId = req.params.id;

  try {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let parsedQuestions = [];

    // Check if pasted JSON text is provided in body
    if (req.body.pastedJSON) {
      try {
        parsedQuestions = JSON.parse(req.body.pastedJSON);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid pasted JSON formatting.' });
      }
    } 
    // Check if file is uploaded
    else if (req.file) {
      const fileContent = req.file.buffer.toString('utf8');
      
      if (req.file.mimetype === 'application/json' || req.file.originalname.endsWith('.json')) {
        try {
          parsedQuestions = JSON.parse(fileContent);
        } catch (err) {
          return res.status(400).json({ message: 'Invalid JSON file formatting.' });
        }
      } else if (req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv')) {
        // Parse CSV format: questionText,option1,option2,option3,option4,correctAnswerIndex,points
        const lines = fileContent.split(/\r?\n/);
        for (let i = 1; i < lines.length; i++) { // Skip headers
          const line = lines[i].trim();
          if (!line) continue;
          
          // Basic split parsing (handles simple comma separated fields)
          const parts = line.split(',');
          if (parts.length >= 6) {
            const questionText = parts[0].trim();
            // Options are columns 1 to 4 or more
            const options = parts.slice(1, parts.length - 2).map(opt => opt.replace(/^"|"$/g, '').trim());
            const correctAnswer = Number(parts[parts.length - 2]);
            const points = Number(parts[parts.length - 1]) || 1;
            
            parsedQuestions.push({
              questionText,
              options,
              correctAnswer,
              points
            });
          }
        }
      } else {
        return res.status(400).json({ message: 'Unsupported file type. Please upload JSON or CSV.' });
      }
    } else {
      return res.status(400).json({ message: 'No file or pasted text content provided.' });
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      return res.status(400).json({ message: 'Parsed data must contain a list of questions.' });
    }

    // Validate and format each question
    const formattedQuestions = parsedQuestions.map(q => {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || q.correctAnswer === undefined) {
        throw new Error('Each question must contain: questionText, options (min 2), and correctAnswer index.');
      }
      return {
        quizId,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: Number(q.correctAnswer),
        points: Number(q.points) || 1
      };
    });

    const saved = await QuestionModel.create(formattedQuestions);
    res.status(201).json({
      message: `Successfully uploaded and registered ${saved.length} questions!`,
      count: saved.length
    });

  } catch (error) {
    console.error('Bulk Upload Error:', error);
    res.status(400).json({ message: error.message || 'Error processing bulk upload' });
  }
};

// ==========================================
// SCORING ENGINE & SUBMISSIONS
// ==========================================

// @desc    Submit quiz answers and score attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitAttempt = async (req, res) => {
  const quizId = req.params.id;
  const { answers, timeTaken } = req.body; // answers: [{ questionId, selectedOption }]

  try {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Enforce single-attempt restriction: check for past attempts
    const existingAttempt = await AttemptModel.find({ userId: req.user._id, quizId });
    if (existingAttempt.length > 0) {
      return res.status(400).json({ message: 'You have already submitted an attempt for this assessment. Only one attempt is permitted.' });
    }

    const questions = await QuestionModel.find({ quizId });
    if (questions.length === 0) {
      return res.status(400).json({ message: 'This quiz has no questions. Cannot grade.' });
    }

    let score = 0;
    let correctAnswersCount = 0;
    let wrongAnswersCount = 0;
    let skippedAnswersCount = 0;

    const answerMap = new Map();
    if (Array.isArray(answers)) {
      answers.forEach(ans => {
        answerMap.set(ans.questionId, ans.selectedOption);
      });
    }

    // Grading logic
    questions.forEach(q => {
      const questionId = q._id.toString();
      const selectedOption = answerMap.get(questionId);

      if (selectedOption === undefined || selectedOption === null) {
        skippedAnswersCount++;
      } else if (Number(selectedOption) === Number(q.correctAnswer)) {
        correctAnswersCount++;
        score += Number(q.points) || 1;
      } else {
        wrongAnswersCount++;
        // Apply negative marking if configured
        score -= Number(quiz.negativeMarking) || 0;
      }
    });

    // Ensure score doesn't fall below zero
    if (score < 0) score = 0;
    
    // Round score to two decimal places
    score = Math.round(score * 100) / 100;

    const attempt = await AttemptModel.create({
      userId: req.user._id,
      quizId,
      answers: answers || [],
      score,
      totalQuestions: questions.length,
      correctAnswersCount,
      wrongAnswersCount,
      skippedAnswersCount,
      timeTaken: Number(timeTaken) || 0
    });

    res.status(201).json({
      attemptId: attempt._id,
      score,
      totalQuestions: questions.length,
      correctAnswersCount,
      wrongAnswersCount,
      skippedAnswersCount,
      timeTaken,
      completedAt: attempt.completedAt,
      questions: questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points
      }))
    });

  } catch (error) {
    console.error('Quiz Submission Error:', error);
    res.status(500).json({ message: 'Server error processing quiz submission' });
  }
};
