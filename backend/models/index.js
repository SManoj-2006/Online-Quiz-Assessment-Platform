import User from './user.model.js';
import Quiz from './quiz.model.js';
import Question from './question.model.js';
import Attempt from './attempt.model.js';
import { dbState } from '../config/dbState.js';
import { dbStore } from '../config/jsonDb.js';

// Unified wrapper to seamlessly switch between Mongo and local JSON filesystem DB
export const UserModel = {
  find: async (query = {}) => {
    if (dbState.useMongo) return await User.find(query).lean();
    return await dbStore.users.find(query);
  },
  findOne: async (query = {}) => {
    if (dbState.useMongo) return await User.findOne(query);
    return await dbStore.users.findOne(query);
  },
  findById: async (id) => {
    if (dbState.useMongo) {
      try {
        return await User.findById(id);
      } catch (e) {
        return null;
      }
    }
    return await dbStore.users.findById(id);
  },
  create: async (data) => {
    if (dbState.useMongo) return await User.create(data);
    return await dbStore.users.create(data);
  }
};

export const QuizModel = {
  find: async (query = {}) => {
    if (dbState.useMongo) return await Quiz.find(query).populate('createdBy', 'username email').lean();
    const quizzes = await dbStore.quizzes.find(query);
    // Populate createdBy manually for JSON DB
    for (const quiz of quizzes) {
      if (quiz.createdBy) {
        const user = await dbStore.users.findById(quiz.createdBy);
        quiz.createdBy = user ? { _id: user._id, username: user.username, email: user.email } : null;
      }
    }
    return quizzes;
  },
  findById: async (id) => {
    if (dbState.useMongo) {
      try {
        return await Quiz.findById(id).populate('createdBy', 'username email');
      } catch (e) {
        return null;
      }
    }
    const quiz = await dbStore.quizzes.findById(id);
    if (quiz && quiz.createdBy) {
      const user = await dbStore.users.findById(quiz.createdBy);
      quiz.createdBy = user ? { _id: user._id, username: user.username, email: user.email } : null;
    }
    return quiz;
  },
  create: async (data) => {
    if (dbState.useMongo) return await Quiz.create(data);
    return await dbStore.quizzes.create(data);
  },
  findByIdAndUpdate: async (id, update) => {
    if (dbState.useMongo) return await Quiz.findByIdAndUpdate(id, update, { new: true });
    return await dbStore.quizzes.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id) => {
    if (dbState.useMongo) return await Quiz.findByIdAndDelete(id);
    // Also delete associated questions
    await QuestionModel.deleteMany({ quizId: id });
    return await dbStore.quizzes.findByIdAndDelete(id);
  }
};

export const QuestionModel = {
  find: async (query = {}) => {
    if (dbState.useMongo) return await Question.find(query).lean();
    return await dbStore.questions.find(query);
  },
  create: async (data) => {
    if (dbState.useMongo) {
      if (Array.isArray(data)) {
        return await Question.insertMany(data);
      }
      return await Question.create(data);
    }
    
    if (Array.isArray(data)) {
      const created = [];
      for (const item of data) {
        created.push(await dbStore.questions.create(item));
      }
      return created;
    }
    return await dbStore.questions.create(data);
  },
  deleteMany: async (query = {}) => {
    if (dbState.useMongo) return await Question.deleteMany(query);
    return await dbStore.questions.deleteMany(query);
  },
  findByIdAndDelete: async (id) => {
    if (dbState.useMongo) return await Question.findByIdAndDelete(id);
    return await dbStore.questions.findByIdAndDelete(id);
  }
};

export const AttemptModel = {
  find: async (query = {}) => {
    if (dbState.useMongo) {
      return await Attempt.find(query)
        .populate('userId', 'username email')
        .populate('quizId', 'title description timeLimit negativeMarking')
        .sort({ score: -1, completedAt: -1 })
        .lean();
    }
    const attempts = await dbStore.attempts.find(query);
    // Populate manual
    for (const attempt of attempts) {
      if (attempt.userId) {
        const user = await dbStore.users.findById(attempt.userId);
        attempt.userId = user ? { _id: user._id, username: user.username, email: user.email } : null;
      }
      if (attempt.quizId) {
        const quiz = await dbStore.quizzes.findById(attempt.quizId);
        attempt.quizId = quiz ? { 
          _id: quiz._id, 
          title: quiz.title, 
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          negativeMarking: quiz.negativeMarking
        } : null;
      }
    }
    // Sort by score descending
    return attempts.sort((a, b) => b.score - a.score || new Date(b.completedAt) - new Date(a.completedAt));
  },
  create: async (data) => {
    if (dbState.useMongo) return await Attempt.create(data);
    return await dbStore.attempts.create(data);
  },
  findById: async (id) => {
    if (dbState.useMongo) {
      try {
        return await Attempt.findById(id)
          .populate('userId', 'username email')
          .populate('quizId', 'title description timeLimit negativeMarking');
      } catch (e) {
        return null;
      }
    }
    const attempt = await dbStore.attempts.findById(id);
    if (attempt) {
      if (attempt.userId) {
        const user = await dbStore.users.findById(attempt.userId);
        attempt.userId = user ? { _id: user._id, username: user.username, email: user.email } : null;
      }
      if (attempt.quizId) {
        const quiz = await dbStore.quizzes.findById(attempt.quizId);
        attempt.quizId = quiz ? { 
          _id: quiz._id, 
          title: quiz.title, 
          description: quiz.description,
          timeLimit: quiz.timeLimit,
          negativeMarking: quiz.negativeMarking
        } : null;
      }
    }
    return attempt;
  }
};
