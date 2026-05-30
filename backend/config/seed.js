import bcrypt from 'bcryptjs';
import { UserModel, QuizModel, QuestionModel } from '../models/index.js';

export const seedData = async () => {
  try {
    const existingUsers = await UserModel.find({});
    
    // Only seed if database is empty
    if (existingUsers.length > 0) {
      console.log('Database already populated. Skipping automatic seeding.');
      return;
    }

    console.log('Starting automatic database seeding...');

    // 1. Create Hashed Passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    // 2. Seed Admin User
    const admin = await UserModel.create({
      username: 'administrator',
      email: 'admin@aura.com',
      password: adminPassword,
      role: 'admin'
    });

    // 3. Seed Student User
    const student = await UserModel.create({
      username: 'johndoe',
      email: 'student@aura.com',
      password: studentPassword,
      role: 'student'
    });

    console.log(`Seeded Default Accounts:`);
    console.log(`   - Admin:   admin@aura.com   (password: admin123)`);
    console.log(`   - Student: student@aura.com (password: student123)`);

    // 4. Seed Web Development Quiz
    const devQuiz = await QuizModel.create({
      title: 'Web Development Core Essentials',
      description: 'Test your understanding of basic HTML, styling conventions in Vanilla CSS, and modern JavaScript ES6 logic structures.',
      timeLimit: 5, // 5 minutes
      negativeMarking: 0.25, // -0.25 per wrong answer
      difficulty: 'medium',
      createdBy: admin._id
    });

    // 5. Seed MCQ Questions
    const questions = [
      {
        quizId: devQuiz._id,
        questionText: 'Which HTML5 element is used to define semantic navigation sections?',
        options: ['<section>', '<nav>', '<header>', '<menu>'],
        correctAnswer: 1, // <nav>
        points: 1
      },
      {
        quizId: devQuiz._id,
        questionText: 'What is the correct HSL value representation for a pure glowing cyan accent color?',
        options: ['hsl(0, 0%, 100%)', 'hsl(240, 100%, 50%)', 'hsl(190, 95%, 50%)', 'hsl(120, 80%, 40%)'],
        correctAnswer: 2, // hsl(190, 95%, 50%)
        points: 1
      },
      {
        quizId: devQuiz._id,
        questionText: 'Which keyword is used to import variables or functions from an external ES6 module file?',
        options: ['require', 'import', 'include', 'link'],
        correctAnswer: 1, // import
        points: 1
      },
      {
        quizId: devQuiz._id,
        questionText: 'What does CSS stand for in web page design?',
        options: ['Computer Style Sheets', 'Creative Style Systems', 'Cascading Style Sheets', 'Color Styling Standards'],
        correctAnswer: 2, // Cascading Style Sheets
        points: 1
      },
      {
        quizId: devQuiz._id,
        questionText: 'Which operator is used to perform exact equality comparisons (type and value) in JavaScript?',
        options: ['=', '==', '===', '!=*'],
        correctAnswer: 2, // ===
        points: 1
      }
    ];

    await QuestionModel.create(questions);
    console.log(`Seeded Quiz: "${devQuiz.title}" with 5 interactive questions.`);
    console.log('Seeding process complete!');

  } catch (error) {
    console.error('Failed seeding database:', error);
  }
};
