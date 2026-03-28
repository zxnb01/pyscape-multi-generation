// src/pages/ModulePage.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState({});

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        // Fetch module
        const { data: mod, error: modErr } = await supabase
          .from('modules')
          .select('id, title, description, difficulty')
          .eq('id', moduleId)
          .single();

        if (modErr) throw modErr;

        // Fetch lessons with parts (sublevels) from database
        const { data: lessonData, error: lessonErr } = await supabase
          .from('lessons')
          .select('id, title, type, order_index, estimated_minutes, parts')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: true });

        if (lessonErr) throw lessonErr;

        // Transform lessons: convert parts array to levels with proper IDs
        const enrichedLessons = (lessonData || []).map(lesson => {
          let levels = [];
          
          // If lesson has parts from database, use them
          if (lesson.parts && Array.isArray(lesson.parts) && lesson.parts.length > 0) {
            levels = lesson.parts.map((part, index) => ({
              id: index, // Use array index as ID (0-based)
              level: part.level || (index + 1),
              title: part.title || `Level ${index + 1}`,
              description: part.description || ''
            }));
            console.log(`✅ Loaded ${levels.length} parts for lesson "${lesson.title}" from database`);
          } else {
            // Fallback: create a single level with lesson title if no parts exist
            levels = [{ 
              id: 0, 
              level: 1,
              title: lesson.title, 
              description: 'Content coming soon' 
            }];
            console.warn(`⚠️ No parts found for lesson "${lesson.title}" - showing placeholder`);
          }

          return {
            ...lesson,
            description: lesson.type === 'read' ? 'Read through the content' : 'Practice with code',
            levels: levels
          };
        });

        setModule(mod);
        setLessons(enrichedLessons);
      } catch (err) {
        console.error('Error fetching module:', err);
        setModule(null);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId]);

  const toggleLesson = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-4 w-16 bg-dark-lighter rounded animate-pulse mb-6" />
        <div className="h-8 w-64 bg-dark-lighter rounded animate-pulse mb-6" />
        <div className="flex flex-col gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
              <div className="h-5 w-48 bg-gray-700 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!module) return <h2 className="text-center text-red-500">Module not found</h2>;

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-6 text-white">{module.title}</h1>
      <h3 className="text-xl font-semibold mb-4 text-gray-300">Lessons</h3>

      <div className="flex flex-col gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-md transition-all"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  {lesson.title}
                </h4>
                <p className="text-gray-400 text-sm">{lesson.description}</p>
              </div>

              <button
                onClick={() => toggleLesson(lesson.id)}
                className="text-blue-400 text-sm font-medium hover:underline focus:outline-none"
              >
                {expandedLessons[lesson.id] ? "Hide Levels ▲" : "View Levels ▼"}
              </button>
            </div>

            {/* Collapsible Levels Section */}
            {expandedLessons[lesson.id] && (
              <div className="flex flex-col gap-2 mt-4 animate-fadeIn">
                {lesson.levels.map((level) => (
                  <Link
                    key={level.id}
                    to={`/learn/${moduleId}/lesson/${lesson.order_index}/level/${level.id}`}
                    className="bg-gray-700 hover:bg-gray-600 text-sm text-blue-300 font-medium py-2 px-4 rounded-md transition transform hover:scale-[1.02]"
                  >
                    {level.title} →
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulePage;
