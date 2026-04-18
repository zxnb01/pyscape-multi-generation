import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { awardQuizXP } from '../gamification/gamificationService';
import useGamification from '../gamification/useGamification';

const OnboardingQuiz = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({}); // { qid: { selected, isCorrect } }
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!user) return navigate('/auth');

    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from('quiz')
        .select('*')
        .order('id', { ascending: true });
      if (error) console.error(error);
      else setQuiz(data);
      setLoading(false);
    };

    fetchQuiz();
  }, [user, navigate]);

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (!quiz.length) return <p className="text-center mt-10 text-gray-400">No questions found.</p>;

  const current = quiz[index];
  const options = typeof current.options === 'string' ? JSON.parse(current.options) : current.options;
  const isSkillQuestion = current.section.includes('Skill Quiz');

  const handleSelect = (opt) => {
    setAnswers({
      ...answers,
      [current.id]: { selected: opt.text, isCorrect: !!opt.is_correct },
    });
  };

  const handleNext = () => {
    setDirection(1);
    setIndex(index + 1);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex(index - 1);
  };

  const { refreshData, showXPNotification } = useGamification();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedAnswers = {};
      Object.keys(answers).forEach((qid) => {
        formattedAnswers[qid] = answers[qid].selected;
      });

      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true, onboarding_answers: formattedAnswers })
        .eq('id', user.id);
      if (error) throw error;

      const quizAwardResult = await awardQuizXP(user.id, 1, 25);
      console.log('✅ Onboarding quiz XP result:', quizAwardResult);

      // Show notifications for XP and badges earned
      if (quizAwardResult.xpAwarded > 0 || (quizAwardResult.newBadges && quizAwardResult.newBadges.length > 0)) {
        showXPNotification(quizAwardResult.xpAwarded, quizAwardResult.newBadges || []);
      }

      setUser((prev) => ({ ...prev, onboarding_completed: true }));
      await refreshData();
      navigate('/app');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round(((index + 1) / quiz.length) * 100);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="max-w-md w-full p-6 bg-dark-lighter rounded-xl shadow-lg">
        <h1 className="text-xl font-bold mb-4 text-primary text-center">Onboarding Quiz</h1>

        <div className="w-full bg-gray-600 rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-semibold mb-2 text-gray-200">{current.section}</h2>
            <p className="mb-4 text-gray-300 whitespace-pre-line">{current.question}</p>

            <div className="flex flex-col gap-2">
              {options.map((opt, i) => {
                const ans = answers[current.id];
                const selected = ans?.selected === opt.text;
                const correct = !!opt.is_correct;

                let bgClass = '';
                let borderClass = '';
                let textClass = '';

                if (isSkillQuestion && ans) {
                  // Skill Quiz: green for correct, red for selected wrong
                  if (correct) {
                    bgClass = 'bg-green-600';
                    borderClass = 'border-green-500';
                    textClass = 'text-white';
                  }
                  if (selected && !correct) {
                    bgClass = 'bg-red-600';
                    borderClass = 'border-red-500';
                    textClass = 'text-white';
                  }
                } else if (!isSkillQuestion && selected) {
                  // Regular question: blue highlight
                  bgClass = 'bg-primary';
                  borderClass = 'border-primary';
                  textClass = 'text-white';
                }

                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(opt)}
                    disabled={!!ans} // lock selection after choosing
                    className={`w-full text-left p-2 rounded border transition-colors duration-200
                      ${bgClass} ${borderClass} ${textClass} 
                      ${!bgClass ? 'border-gray-600 text-gray-300 hover:border-primary hover:bg-primary/10' : ''}
                    `}
                  >
                    {opt.text}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="btn-secondary"
          >
            Previous
          </button>

          {index < quiz.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[current.id]}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!answers[current.id]}
              className="btn-primary"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuiz;