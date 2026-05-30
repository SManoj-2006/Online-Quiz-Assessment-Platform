import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Quiz from './models/quiz.model.js';
import Question from './models/question.model.js';
import Attempt from './models/attempt.model.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quiz_platform';
    console.log(`🧹 Connecting to MongoDB to wipe data: ${connUri}...`);
    
    await mongoose.connect(connUri);
    
    // Wipe all standard collections
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await Attempt.deleteMany({});
    
    console.log('✅ MongoDB database has been completely wiped and is now blank!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
};

clearDatabase();
