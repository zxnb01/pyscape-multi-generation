import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaBuilding, FaPen, FaVenus, FaMars, FaQuestion, FaGraduationCap, FaBriefcase, FaEllipsisH, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// avatars
import avatar1 from '../images/image1.png';
import avatar2 from '../images/image2.png';
import avatar3 from '../images/image3.png';
import avatar4 from '../images/image4.png';
import avatar5 from '../images/image5.png';
import avatar6 from '../images/image6.png';
import avatar7 from '../images/image7.png';
import avatar8 from '../images/image8.png';
import avatar9 from '../images/image9.png';
import avatar10 from '../images/image10.png';
import avatar11 from '../images/image11.png';
import avatar12 from '../images/image12.png';
import avatar13 from '../images/image13.png';
import avatar14 from '../images/image14.png';
import avatar15 from '../images/image15.png';
import avatar16 from '../images/image16.png';
import avatar17 from '../images/image17.png';
import avatar18 from '../images/image18.png';
import avatar19 from '../images/image19.png';
import avatar20 from '../images/image20.png';
import avatar21 from '../images/image21.png';
import avatar22 from '../images/image22.png';

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10, avatar11, avatar12, avatar13, avatar14, avatar15, avatar16, avatar17, avatar18, avatar19, avatar20, avatar21, avatar22];

// categories
const categories = [
  {
    name: "Programming",
    icon: "💻",
    topics: [
      { id: "python", name: "Python", icon: "🐍" },
      { id: "javascript", name: "JavaScript", icon: "⚡" },
      { id: "typescript", name: "TypeScript", icon: "📘" },
      { id: "java", name: "Java", icon: "☕" },
      { id: "cpp", name: "C++", icon: "⚙️" },
      { id: "csharp", name: "C#", icon: "🔷" },
      { id: "go", name: "Go", icon: "🔵" },
      { id: "rust", name: "Rust", icon: "🦀" },
      { id: "react", name: "React", icon: "⚛️" },
      { id: "nodejs", name: "Node.js", icon: "💚" },
    ],
  },
  {
    name: "Web Development",
    icon: "🌐",
    topics: [
      { id: "frontend", name: "Frontend", icon: "🎨" },
      { id: "backend", name: "Backend", icon: "🔧" },
      { id: "fullstack", name: "Full Stack", icon: "🔗" },
      { id: "html-css", name: "HTML & CSS", icon: "🎯" },
      { id: "tailwindcss", name: "Tailwind CSS", icon: "💨" },
      { id: "bootstrap", name: "Bootstrap", icon: "🅱️" },
      { id: "webdesign", name: "Web Design", icon: "🎨" },
      { id: "ux-ui", name: "UX/UI", icon: "✨" },
      { id: "responsive", name: "Responsive Design", icon: "📱" },
      { id: "webdev", name: "Web Development", icon: "🌐" },
    ],
  },
  {
    name: "Machine Learning",
    icon: "🤖",
    topics: [
      { id: "linear-regression", name: "Linear Regression", icon: "📈" },
      { id: "logistic-regression", name: "Logistic Regression", icon: "📊" },
      { id: "decision-trees", name: "Decision Trees", icon: "🌳" },
      { id: "random-forest", name: "Random Forest", icon: "🌲" },
      { id: "svm", name: "SVM", icon: "⚖️" },
      { id: "naive-bayes", name: "Naive Bayes", icon: "📋" },
      { id: "knn", name: "KNN", icon: "🎯" },
      { id: "ensemble-methods", name: "Ensemble", icon: "🎭" },
      { id: "xgboost", name: "XGBoost", icon: "🚀" },
      { id: "clustering", name: "Clustering", icon: "🔍" },
    ],
  },
  {
    name: "Deep Learning",
    icon: "🧠",
    topics: [
      { id: "neural-networks", name: "Neural Networks", icon: "🧠" },
      { id: "cnn", name: "CNN", icon: "🖼️" },
      { id: "rnn", name: "RNN", icon: "🔄" },
      { id: "lstm", name: "LSTM", icon: "🧮" },
      { id: "transformers", name: "Transformers", icon: "🔄" },
      { id: "gan", name: "GANs", icon: "🎨" },
      { id: "autoencoders", name: "Autoencoders", icon: "🔄" },
      { id: "attention", name: "Attention", icon: "👁️" },
      { id: "transfer-learning", name: "Transfer Learning", icon: "🔁" },
    ],
  },
  {
    name: "Data Science",
    icon: "📊",
    topics: [
      { id: "statistics", name: "Statistics", icon: "📋" },
      { id: "probability", name: "Probability", icon: "🎲" },
      { id: "hypothesis-testing", name: "Hypothesis Testing", icon: "🧪" },
      { id: "ab-testing", name: "A/B Testing", icon: "⚖️" },
      { id: "time-series", name: "Time Series", icon: "📈" },
      { id: "forecasting", name: "Forecasting", icon: "🔮" },
      { id: "pandas", name: "Pandas", icon: "🐼" },
      { id: "scipy", name: "SciPy", icon: "🔬" },
      { id: "visualization", name: "Visualization", icon: "📉" },
      { id: "sql", name: "SQL", icon: "🗃️" },
    ],
  },
  {
    name: "AI Fields",
    icon: "💬",
    topics: [
      { id: "nlp", name: "NLP", icon: "💬" },
      { id: "text-preprocessing", name: "Text Processing", icon: "📝" },
      { id: "sentiment-analysis", name: "Sentiment Analysis", icon: "😊" },
      { id: "chatbots", name: "Chatbots", icon: "🤖" },
      { id: "llm", name: "LLMs", icon: "💭" },
      { id: "computer-vision", name: "Computer Vision", icon: "👁️" },
      { id: "object-detection", name: "Object Detection", icon: "📦" },
      { id: "face-recognition", name: "Face Recognition", icon: "👤" },
      { id: "reinforcement-learning", name: "RL", icon: "🎮" },
      { id: "game-ai", name: "Game AI", icon: "🕹️" },
    ],
  },
  {
    name: "Cloud & DevOps",
    icon: "☁️",
    topics: [
      { id: "cloud-computing", name: "Cloud Computing", icon: "☁️" },
      { id: "aws", name: "AWS", icon: "🟠" },
      { id: "azure", name: "Azure", icon: "🔷" },
      { id: "gcp", name: "GCP", icon: "🟡" },
      { id: "docker", name: "Docker", icon: "🐳" },
      { id: "kubernetes", name: "Kubernetes", icon: "☸️" },
      { id: "devops", name: "DevOps", icon: "🔧" },
      { id: "ci-cd", name: "CI/CD", icon: "🔄" },
      { id: "terraform", name: "Terraform", icon: "🏗️" },
      { id: "serverless", name: "Serverless", icon: "⚡" },
    ],
  },
  {
    name: "Career",
    icon: "🎯",
    topics: [
      { id: "dsa", name: "DSA", icon: "🧮" },
      { id: "algorithms", name: "Algorithms", icon: "📊" },
      { id: "system-design", name: "System Design", icon: "🏗️" },
      { id: "coding-interviews", name: "Coding Interviews", icon: "🎯" },
      { id: "leetcode", name: "LeetCode", icon: "💻" },
      { id: "freelancing", name: "Freelancing", icon: "💰" },
      { id: "startups", name: "Startups", icon: "🚀" },
      { id: "productivity", name: "Productivity", icon: "⚡" },
      { id: "cs-career", name: "CS Career", icon: "💼" },
      { id: "learn-programming", name: "Learn Programming", icon: "📚" },
    ],
  },
];

export default function ProfileBuild() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const avatarRef = useRef();

  const [step, setStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [avatarStart, setAvatarStart] = useState(0);
  const [showAllInterests, setShowAllInterests] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    gender: "",
    role: "",
    organization: "",
    bio: "",
    avatar_url: avatars[0],
  });

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user]);

  const toggleTopic = (id) => {
    const newSet = new Set(selectedTopics);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedTopics(newSet);
  };

  const handleSubmit = async () => {
    await supabase.from("profiles").upsert({
      id: user.id,
      ...form,
      selected_topics: Array.from(selectedTopics),
      profile_complete: true,
      onboarding_completed: true,
    });
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b] text-white px-4">

      <div className="w-full max-w-xl p-6 rounded-2xl border border-blue-900 bg-[#020617] shadow-xl relative">

        {/* BACK BUTTON */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="absolute top-4 left-4 text-gray-400"
          >
            ←
          </button>
        )}

        {/* PROGRESS */}
        <div className="mb-6">
          <p className="text-sm text-center text-gray-400 mb-2">
            Step {step} of 4
          </p>
          <div className="w-full bg-gray-700 h-2 rounded-full">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="s1" className="space-y-6 text-center">

              <h1 className="text-2xl font-bold">
                Let’s get started!
              </h1>

              <p className="text-gray-400 text-sm">
                Create your profile to personalize your learning journey.
              </p>

              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative w-24 h-24 rounded-full border-4 border-purple-500 overflow-hidden">
                  <img
                    src={form.avatar_url}
                    alt="Selected avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* Avatar row */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAvatarStart(Math.max(0, avatarStart - 6))}
                  disabled={avatarStart === 0}
                  className="text-gray-400 disabled:opacity-30"
                >
                  <FaChevronLeft />
                </button>
                <div className="flex gap-2 flex-1 justify-center">
                  {avatars.slice(avatarStart, avatarStart + 6).map((a, i) => (
                    <img
                      key={avatarStart + i}
                      src={a}
                      onClick={() =>
                        setForm({ ...form, avatar_url: a })
                      }
                      className={`w-12 h-12 rounded-full cursor-pointer border-2 ${
                        form.avatar_url === a
                          ? "border-purple-500"
                          : "border-gray-600 opacity-60"
                      }`}
                      style={{ objectFit: 'cover' }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setAvatarStart(Math.min(avatars.length - 6, avatarStart + 6))}
                  disabled={avatarStart >= avatars.length - 6}
                  className="text-gray-400 disabled:opacity-30"
                >
                  <FaChevronRight />
                </button>
              </div>

              {/* Name */}
              <p className="text-sm text-gray-400 text-left">
                What should we call you?
              </p>

              <div className="flex items-center bg-[#1e293b] px-4 py-3 rounded-xl">
                <FaUser className="mr-3 text-gray-400" />
                <input
                  placeholder="Enter your name"
                  className="bg-transparent w-full outline-none"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                />
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500"
              >
                Continue
              </button>

              <button
                onClick={() => navigate("/app")}
                className="text-gray-400 text-sm"
              >
                Skip
              </button>

            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="s2" className="space-y-5">

              <h2 className="text-xl text-center font-bold">
                Tell us about yourself
              </h2>

              <p className="text-center text-gray-400 text-sm">
                This helps us personalize your experience.
              </p>

              <div className="bg-[#0f172a] border border-gray-700 rounded-2xl p-4 space-y-4">

                {/* Gender */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <FaUser className="mr-2" /> Gender
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Male", icon: <FaMars /> },
                      { label: "Female", icon: <FaVenus /> },
                      { label: "Prefer not to say", icon: <FaQuestion /> }
                    ].map(({ label, icon }) => (
                      <button
                        key={label}
                        onClick={() => setForm({ ...form, gender: label })}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1 ${
                          form.gender === label
                            ? "border border-purple-500 bg-purple-500/10"
                            : "bg-[#1e293b]"
                        }`}
                      >
                        {icon}
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                    <FaBriefcase className="mr-2" /> Role
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Student", icon: <FaGraduationCap /> },
                      { label: "Professional", icon: <FaBriefcase /> },
                      { label: "Other", icon: <FaEllipsisH /> }
                    ].map(({ label, icon }) => (
                      <button
                        key={label}
                        onClick={() => setForm({ ...form, role: label })}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1 ${
                          form.role === label
                            ? "border border-purple-500 bg-purple-500/10"
                            : "bg-[#1e293b]"
                        }`}
                      >
                        {icon}
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Org */}
                <div className="flex items-center bg-[#1e293b] px-4 py-3 rounded-xl">
                  <FaBuilding className="mr-3 text-gray-400" />
                  <input
                    placeholder="Organization"
                    value={form.organization}
                    className="bg-transparent w-full outline-none"
                    onChange={(e) =>
                      setForm({ ...form, organization: e.target.value })
                    }
                  />
                </div>

                {/* Bio */}
                <div className="flex items-start bg-[#1e293b] px-4 py-3 rounded-xl">
                  <FaPen className="mr-3 mt-1 text-gray-400" />
                  <textarea
                    className="bg-transparent w-full outline-none"
                    rows={2}
                    value={form.bio}
                    onChange={(e) =>
                      setForm({ ...form, bio: e.target.value })
                    }
                  />
                </div>

              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl"
              >
                Continue
              </button>

            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="s3" className="space-y-5">

              <h2 className="text-xl text-center font-bold">
                What are you interested in?
              </h2>

              <p className="text-center text-gray-400 text-sm">
                🎯 Personalized for you — we’ll recommend the best content based on your interests
              </p>

              <div className="space-y-6 max-h-80 overflow-y-auto pr-2">

                {categories.slice(0, showAllInterests ? categories.length : 4).map((cat) => (
                  <div key={cat.name}>
                    <p className="text-sm text-gray-300 mb-2">
                      {cat.icon} {cat.name}
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {cat.topics.map((t) => {
                        const selected = selectedTopics.has(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleTopic(t.id)}
                            className={`p-3 rounded-xl text-sm ${
                              selected
                                ? "bg-purple-500"
                                : "bg-[#1e293b]"
                            }`}
                          >
                            {t.icon} {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {categories.length > 4 && (
                  <button
                    onClick={() => setShowAllInterests(!showAllInterests)}
                    className="w-full py-2 text-center text-purple-400 text-sm hover:text-purple-300"
                  >
                    {showAllInterests ? "Show Less" : "Show More Interests"}
                  </button>
                )}

              </div>

              <button
                onClick={() => setStep(4)}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl"
              >
                Continue
              </button>

            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <motion.div key="s4" className="text-center space-y-6">

              <div className="relative">
                <div className="rounded-full border-4 border-purple-500 w-fit mx-auto overflow-hidden">
                  <img
                    src={form.avatar_url}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold">
                Profile Completed!
              </h2>

              <p className="text-gray-400">
                You're all set. Let's start your learning adventure 🚀
              </p>

              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl"
              >
                Let’s Go!
              </button>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}