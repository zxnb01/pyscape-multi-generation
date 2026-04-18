import React, { useState, useEffect } from 'react';
import * as quizService from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import useGamification from '../gamification/useGamification';
import { updateStreak, checkAndAwardBadges } from '../gamification/gamificationService';
import './ModuleQuiz.css';

/**
 * MODULE QUIZ COMPONENT
 * Displays and manages module-level quizzes
 * Features:
 * - Access control (only after all lessons completed)
 * - Quiz taking with progress save
 * - Score calculation
 * - Results display with explanations
 * - Multiple attempts with best score tracking
 */

export default function ModuleQuiz({ moduleId, moduleName }) {
  const { user } = useAuth();
  const { awardXPWithNotification, refreshData, showXPNotification, checkAndAwardBadges, updateStreak } = useGamification();

  // State
  const [quizState, setQuizState] = useState('checking'); // checking|locked|ready|taking|results
  const [quiz, setQuiz] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeStarted, setTimeStarted] = useState(null);
  const [attemptResult, setAttemptResult] = useState(null);
  const [bestScore, setBestScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewAnswers, setReviewAnswers] = useState(null);

  // Timer effect for quiz duration
  useEffect(() => {
    if (quizState === 'taking' && timeStarted) {
      const interval = setInterval(() => {
        // Timer running - used for tracking time spent
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [quizState, timeStarted]);

  // Initialize quiz
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user?.id) return;
    
    initializeQuiz();
  }, [user?.id, moduleId]);

  // Save progress periodically
  useEffect(() => {
    if (quizState !== 'taking' || !quiz?.quiz_id) return;

    const saveInterval = setInterval(() => {
      quizService.saveQuizProgress(
        user.id,
        quiz.quiz_id,
        currentQuestionIndex,
        JSON.stringify(answers)
      );
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [quizState, quiz, currentQuestionIndex, answers, user?.id]);

  const initializeQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check access
      const access = await quizService.canUserAccessQuiz(user.id, moduleId);
      setAccessStatus(access);

      if (!access.can_access) {
        setQuizState('locked');
        setLoading(false);
        return;
      }

      // Fetch quiz
      const quizData = await quizService.getModuleQuiz(moduleId);
      if (!quizData) {
        setError('Quiz not found for this module');
        setQuizState('ready');
        setLoading(false);
        return;
      }

      setQuiz(quizData);

      // Fetch best score
      const bestScore = await quizService.getUserBestQuizScore(user.id, quizData.quiz_id);
      setBestScore(bestScore);

      // Check for saved progress
      const savedProgress = await quizService.getQuizProgress(user.id, quizData.quiz_id);
      if (savedProgress) {
        setCurrentQuestionIndex(savedProgress.current_question_index || 0);
        setAnswers(savedProgress.answered_questions || {});
      }

      setQuizState('ready');
    } catch (err) {
      console.error('Error initializing quiz:', err);
      setError('Failed to load quiz');
      setQuizState('ready');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setTimeStarted(Date.now());
    setQuizState('taking');
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleSelectAnswer = (optionIndex) => {
    const questionId = quiz.questions[currentQuestionIndex].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      
      const timeSpent = Math.round((Date.now() - timeStarted) / 1000);
      const result = await quizService.submitQuiz(
        user.id,
        quiz.quiz_id,
        answers,
        timeSpent
      );

      if (result.success) {
        // Calculate which answers were correct for review
        const reviewData = quiz.questions.map((q, idx) => {
          const selectedOptionIdx = answers[q.id];
          const correctOptionIdx = q.options.findIndex(o => o.isCorrect);
          const isCorrect = selectedOptionIdx === correctOptionIdx;
          
          return {
            questionId: q.id,
            question: q.question,
            userSelectedIndex: selectedOptionIdx,
            correctIndex: correctOptionIdx,
            options: q.options,
            isCorrect,
            explanation: q.explanation || 'Review the module content to understand this concept better.',
            difficulty: q.difficulty
          };
        });

        setReviewAnswers(reviewData);
        setAttemptResult(result.result);
        setBestScore({
          best_score: Math.max(bestScore?.best_score || 0, result.result.score),
          is_passing: result.result.is_passing,
          attempts_count: (bestScore?.attempts_count || 0) + 1
        });

        // Award XP if passing
        if (result.result.is_passing && awardXPWithNotification) {
          const xpEarned = result.result.xp_earned || 0;
          console.log(`🎯 Quiz passed! XP to award: ${xpEarned}`);
          
          if (xpEarned > 0) {
            try {
              await awardXPWithNotification(xpEarned, 'quiz', quiz.quiz_id);
              console.log(`✅ XP awarded: ${xpEarned}`);
            } catch (xpErr) {
              console.error('❌ Failed to award XP:', xpErr);
            }
          } else {
            console.warn(`⚠️ No XP to award (xp_earned=${xpEarned})`);
          }
          
          // Update streak and check badges
          try {
            await updateStreak(user.id);
            const additionalBadges = await checkAndAwardBadges(user.id);
            if (additionalBadges && additionalBadges.length > 0) {
              showXPNotification(0, additionalBadges);
            }
            await refreshData();
            console.log(`✅ Gamification updated after quiz, additional badges: ${additionalBadges?.length || 0}`);
          } catch (gamErr) {
            console.error('❌ Failed to update gamification:', gamErr);
          }
        }

        setQuizState('results');
      } else {
        setError('Failed to submit quiz: ' + result.error?.message);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Error submitting quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = async () => {
    try {
      setLoading(true);
      // Clear progress
      await quizService.clearQuizProgress(user.id, quiz.quiz_id);
      
      // Reload quiz from database to get fresh data
      const freshQuizData = await quizService.getModuleQuiz(moduleId);
      if (freshQuizData) {
        setQuiz(freshQuizData);
      }
      
      setAnswers({});
      setCurrentQuestionIndex(0);
      setAttemptResult(null);
      setReviewAnswers(null);
      setQuizState('taking');
      setTimeStarted(Date.now());
    } catch (err) {
      console.error('Error retaking quiz:', err);
      setError('Failed to reload quiz for retake');
    } finally {
      setLoading(false);
    }
  };

  /*
  // DEPRECATED: Different questions feature has been removed
  const handleRegenerateQuiz = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Regenerating quiz for module ${moduleId}...`);
      
      // Delete old quiz and generate new one
      const newQuizData = await quizService.regenerateModuleQuiz(moduleId);
      
      if (newQuizData) {
        setQuiz(newQuizData);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setAttemptResult(null);
        setReviewAnswers(null);
        setQuizState('ready');
        console.log('✅ Quiz regenerated with new questions!');
      } else {
        setError('Failed to regenerate quiz');
      }
    } catch (err) {
      console.error('❌ Error regenerating quiz:', err);
      setError('Failed to regenerate quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  */

  const handleCancel = () => {
    quizService.clearQuizProgress(user.id, quiz.quiz_id);
    setQuizState('ready');
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Render: Quiz Locked
  if (quizState === 'locked') {
    return (
      <div className="module-quiz locked-state">
        <div className="quiz-card">
          <div className="lock-icon">🔒</div>
          <h3>Quiz Locked</h3>
          <p>{accessStatus?.reason}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(accessStatus?.completed_lessons / accessStatus?.total_lessons) * 100}%` }}
            />
          </div>
          <p className="progress-text">
            {accessStatus?.completed_lessons} of {accessStatus?.total_lessons} lessons completed
          </p>
        </div>
      </div>
    );
  }

  // Render: Loading
  if (loading || quizState === 'checking') {
    return (
      <div className="module-quiz loading-state">
        <div className="spinner">Loading quiz...</div>
      </div>
    );
  }

  // Render: Error
  if (error) {
    return (
      <div className="module-quiz error-state">
        <div className="error-message">❌ {error}</div>
        <button onClick={initializeQuiz} className="btn-retry">Retry</button>
      </div>
    );
  }

  // Render: Ready to start
  if (quizState === 'ready' && !attemptResult) {
    return (
      <div className="module-quiz ready-state">
        <div className="quiz-card">
          <h3>🎯 {quiz?.quiz_title || `${moduleName} Mastery Quiz`}</h3>
          <p className="quiz-description">{quiz?.description}</p>
          
          <div className="quiz-info">
            <div className="info-item">
              <span className="label">Questions:</span>
              <span className="value">{quiz?.num_questions || 10}</span>
            </div>
            <div className="info-item">
              <span className="label">Passing Score:</span>
              <span className="value">{quiz?.passing_score || 70}%</span>
            </div>
            <div className="info-item">
              <span className="label">Time Limit:</span>
              <span className="value">No limit</span>
            </div>
          </div>

          {bestScore?.attempts_count > 0 && (
            <div className="previous-score">
              <p>📊 Best Score: <strong>{bestScore.best_score}%</strong> ({bestScore.attempts_count} attempt{bestScore.attempts_count !== 1 ? 's' : ''})</p>
              {bestScore.is_passing && <p className="passing-badge">✅ Quiz Passed</p>}
            </div>
          )}

          <button 
            onClick={handleStartQuiz} 
            className="btn-start"
            disabled={loading}
          >
            {bestScore?.attempts_count > 0 ? 'Retake Quiz' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // Render: Taking Quiz
  if (quizState === 'taking' && quiz?.questions) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQuestion.id];

    return (
      <div className="module-quiz taking-state">
        <div className="quiz-header">
          <div className="quiz-progress">
            <div className="progress-bar-thin">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
            <p className="progress-text">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <button onClick={handleCancel} className="btn-close">✕</button>
        </div>

        <div className="quiz-card question-card">
          <div className={`difficulty-badge ${currentQuestion.difficulty}`}>
            {currentQuestion.difficulty.toUpperCase()}
          </div>
          
          <h3 className="question-text">{currentQuestion.question_text}</h3>

          <div className="options-container">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={`option-button ${
                  selectedAnswer === idx ? 'selected' : ''
                }`}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>

          <div className="quiz-navigation">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn-nav"
            >
              ← Previous
            </button>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="btn-nav"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < quiz.questions.length || loading}
                className="btn-submit"
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>

          <p className="unanswered-hint">
            {Object.keys(answers).length < quiz.questions.length && 
              `${quiz.questions.length - Object.keys(answers).length} question(s) unanswered`}
          </p>
        </div>
      </div>
    );
  }

  // Render: Results with Answer Review
  if (quizState === 'results' && attemptResult) {
    const isPassing = attemptResult.is_passing;

    return (
      <div className="module-quiz results-state">
        {/* Summary Card */}
        <div className={`quiz-card results-card ${isPassing ? 'passing' : 'not-passing'}`}>
          <div className="results-icon">
            {isPassing ? '🎉' : '📚'}
          </div>

          <h3>{isPassing ? 'Quiz Passed!' : 'Keep Learning'}</h3>

          <div className="score-display">
            <div className="score-number">{Math.round(attemptResult.score)}%</div>
            <div className="score-details">
              <p>{attemptResult.correct_count} of {attemptResult.total_count} correct</p>
            </div>
          </div>

          {isPassing && (
            <div className="xp-reward">
              <p className="xp-text">🌟 Earned <strong>{attemptResult.xp_earned} XP</strong></p>
            </div>
          )}

          <div className="results-actions">
            <button onClick={handleRetakeQuiz} className="btn-retake">
              {bestScore?.attempts_count > 1 ? 'Try Again' : 'Retake Quiz'}
            </button>
            <button onClick={() => setQuizState('ready')} className="btn-continue">
              Back to Quiz Info
            </button>
          </div>

          {!isPassing && (
            <p className="retry-hint">
              Review the material and try again to pass ({Math.ceil(quiz.passing_score)}% required)
            </p>
          )}
        </div>

        {/* Answer Review Section */}
        {reviewAnswers && (
          <div className="quiz-card answers-review-card">
            <h3 className="review-title">📝 Answer Review</h3>
            
            <div className="answers-list">
              {reviewAnswers.map((review, idx) => {
                return (
                  <div key={review.questionId} className="answer-review-item">
                    <div className="review-header">
                      <span className="question-number">Question {idx + 1} of {reviewAnswers.length}</span>
                      <span className={`difficulty-badge ${review.difficulty}`}>
                        {review.difficulty?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </div>

                    <div className="question-box">
                      <h4 className="question-label">📖 Question:</h4>
                      <p className="question-text">{review.question}</p>
                    </div>

                    <div className="answer-options">
                      {review.options.map((option, optIdx) => {
                        const isSelected = optIdx === review.userSelectedIndex;
                        const isCorrectOption = optIdx === review.correctIndex;
                        let optionClass = 'answer-option';
                        
                        if (isCorrectOption) {
                          optionClass += ' correct-answer';
                        } else if (isSelected && !review.isCorrect) {
                          optionClass += ' wrong-answer';
                        }

                        return (
                          <div key={optIdx} className={optionClass}>
                            <div className="option-content">
                              <span className="option-letter">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="option-text">{option.text}</span>
                            </div>
                            
                            {isCorrectOption && (
                              <span className="badge-correct">✓ Correct</span>
                            )}
                            {isSelected && !review.isCorrect && (
                              <span className="badge-wrong">✗ Your Answer</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="explanation-box">
                      <p className="explanation-label">💡 Explanation:</p>
                      <p className="explanation-text">{review.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}