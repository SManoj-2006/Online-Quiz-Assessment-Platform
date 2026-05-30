import { AttemptModel, QuizModel, UserModel, QuestionModel } from '../models/index.js';

// @desc    Get leaderboard rankings
// @route   GET /api/analytics/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  const { quizId } = req.query;

  try {
    let query = {};
    if (quizId) {
      query.quizId = quizId;
    }

    const allAttempts = await AttemptModel.find(query);

    // Group by User to show each student's BEST score per quiz
    // If it's a specific quiz, we just group by user and take their highest score
    const userBestAttempts = {};

    allAttempts.forEach(att => {
      const uId = att.userId?._id?.toString() || att.userId?.toString();
      if (!uId) return;

      const userKey = quizId 
        ? uId 
        : `${uId}_${att.quizId?._id?.toString() || att.quizId?.toString()}`;

      if (!userBestAttempts[userKey] || userBestAttempts[userKey].score < att.score) {
        userBestAttempts[userKey] = att;
      }
    });

    const bestAttemptsList = Object.values(userBestAttempts);

    // Now, aggregate score per user
    const leaderboardMap = {};

    bestAttemptsList.forEach(att => {
      const username = att.userId?.username || 'Anonymous';
      const email = att.userId?.email || 'N/A';
      const uId = att.userId?._id?.toString() || att.userId?.toString();
      if (!uId) return;

      if (!leaderboardMap[uId]) {
        leaderboardMap[uId] = {
          userId: uId,
          username,
          email,
          totalQuizzesTaken: 0,
          totalScore: 0,
          attempts: []
        };
      }

      leaderboardMap[uId].totalQuizzesTaken += 1;
      leaderboardMap[uId].totalScore += att.score;
      leaderboardMap[uId].attempts.push({
        quizId: att.quizId?._id || att.quizId,
        quizTitle: att.quizId?.title || 'Unknown Quiz',
        score: att.score,
        correctCount: att.correctAnswersCount,
        totalQuestions: att.totalQuestions,
        completedAt: att.completedAt
      });
    });

    // Convert map to list and sort by aggregated totalScore or average score
    const leaderboard = Object.values(leaderboardMap).map(user => {
      return {
        ...user,
        averageScore: user.totalQuizzesTaken > 0 
          ? Math.round((user.totalScore / user.totalQuizzesTaken) * 100) / 100
          : 0
      };
    });

    // Sort by totalScore descending, then by averageScore descending
    leaderboard.sort((a, b) => b.totalScore - a.totalScore || b.averageScore - a.averageScore);

    res.json(leaderboard.slice(0, 20)); // Return top 20 rankings

  } catch (error) {
    console.error('Leaderboard Fetch Error:', error);
    res.status(500).json({ message: 'Server error retrieving leaderboard rankings' });
  }
};

// @desc    Get admin statistics and analytical charts data
// @route   GET /api/analytics/admin
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const quizzes = await QuizModel.find({});
    const questions = await QuestionModel.find({});
    const users = await UserModel.find({});
    const attempts = await AttemptModel.find({});

    const totalQuizzes = quizzes.length;
    const totalQuestions = questions.length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalAttempts = attempts.length;

    // Calculate aggregated metrics
    let totalScoreAll = 0;
    let highestScore = 0;
    let averageCompletionTime = 0; // seconds

    attempts.forEach(att => {
      totalScoreAll += att.score;
      if (att.score > highestScore) highestScore = att.score;
      averageCompletionTime += att.timeTaken;
    });

    const averageScore = totalAttempts > 0 
      ? Math.round((totalScoreAll / totalAttempts) * 100) / 100 
      : 0;
      
    const averageTime = totalAttempts > 0 
      ? Math.round(averageCompletionTime / totalAttempts) 
      : 0;

    // Score distribution calculation
    const scoreRanges = {
      excellent: 0, // 80%+
      good: 0,      // 60-79%
      average: 0,   // 40-59%
      poor: 0       // Below 40%
    };

    attempts.forEach(att => {
      const percentage = (att.score / att.totalQuestions) * 100;
      if (percentage >= 80) scoreRanges.excellent++;
      else if (percentage >= 60) scoreRanges.good++;
      else if (percentage >= 40) scoreRanges.average++;
      else scoreRanges.poor++;
    });

    // Quiz-specific statistics
    const quizStats = [];
    for (const quiz of quizzes) {
      const quizAttempts = attempts.filter(att => {
        const attQuizId = att.quizId?._id?.toString() || att.quizId?.toString();
        return attQuizId === quiz._id.toString();
      });

      let quizTotalScore = 0;
      let quizHighScore = 0;
      quizAttempts.forEach(att => {
        quizTotalScore += att.score;
        if (att.score > quizHighScore) quizHighScore = att.score;
      });

      const quizAvgScore = quizAttempts.length > 0 
        ? Math.round((quizTotalScore / quizAttempts.length) * 100) / 100
        : 0;

      quizStats.push({
        quizId: quiz._id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        totalAttempts: quizAttempts.length,
        averageScore: quizAvgScore,
        highestScore: quizHighScore
      });
    }

    res.json({
      summary: {
        totalQuizzes,
        totalQuestions,
        totalStudents,
        totalAttempts,
        averageScore,
        highestScore,
        averageTime
      },
      scoreRanges,
      quizStats,
      attempts
    });

  } catch (error) {
    console.error('Admin Analytics Error:', error);
    res.status(500).json({ message: 'Server error compiling administrative statistics' });
  }
};

// @desc    Get statistics for an individual student dashboard
// @route   GET /api/analytics/student
// @access  Private
export const getUserDashboard = async (req, res) => {
  try {
    const attempts = await AttemptModel.find({ userId: req.user._id });
    
    // Sort attempts by completedAt descending
    attempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    let totalScore = 0;
    let totalTime = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    
    attempts.forEach(att => {
      totalScore += att.score;
      totalTime += att.timeTaken;
      totalCorrect += att.correctAnswersCount;
      totalWrong += att.wrongAnswersCount;
    });

    const quizzesTaken = attempts.length;
    const averageScore = quizzesTaken > 0 
      ? Math.round((totalScore / quizzesTaken) * 100) / 100 
      : 0;

    res.json({
      stats: {
        quizzesTaken,
        totalScore,
        averageScore,
        totalTime,
        totalCorrect,
        totalWrong
      },
      history: attempts
    });

  } catch (error) {
    console.error('Student Analytics Error:', error);
    res.status(500).json({ message: 'Server error retrieving user metrics' });
  }
};

// @desc    Get detailed scorecard for a specific past attempt
// @route   GET /api/analytics/attempts/:id
// @access  Private
export const getAttemptDetails = async (req, res) => {
  try {
    const attempt = await AttemptModel.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Verify ownership: only the user who made the attempt or an admin can access
    const attemptUserId = attempt.userId?._id?.toString() || attempt.userId?.toString();
    if (req.user.role !== 'admin' && attemptUserId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this attempt scorecard' });
    }

    // Get the questions for the quiz to show the answers
    const quizId = attempt.quizId?._id || attempt.quizId;
    const questions = await QuestionModel.find({ quizId });

    res.json({
      attempt,
      questions: questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points
      }))
    });
  } catch (error) {
    console.error('Fetch Attempt Details Error:', error);
    res.status(500).json({ message: 'Server error retrieving attempt scorecard' });
  }
};

