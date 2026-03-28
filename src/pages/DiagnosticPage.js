import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

const DiagnosticPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching Module 1...');
        
        // Fetch Module 1
        const { data: module, error: modErr } = await supabase
          .from('modules')
          .select('*')
          .eq('id', 1);

        console.log('Module query result:', module, 'Error:', modErr);

        if (modErr) throw modErr;
        if (!module || module.length === 0) {
          throw new Error('Module 1 not found in database');
        }

        console.log('✅ Module found:', module[0].title);

        // Fetch all lessons for Module 1 with all columns
        const { data: lessons, error: lessErr } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', 1)
          .order('order_index', { ascending: true });

        if (lessErr) throw lessErr;

        console.log(`✅ Found ${lessons?.length || 0} lessons`);

        setData({
          module: module[0],
          lessons: lessons || [],
          totalLessons: lessons?.length || 0,
          lessonsWithParts: lessons?.filter(l => l.parts && Array.isArray(l.parts) && l.parts.length > 0).length || 0
        });
      } catch (err) {
        console.error('Diagnostic error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading diagnostics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 bg-dark min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Module 1 Diagnostics</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-2">{data.module?.title}</h2>
        <p className="text-gray-400">ID: {data.module?.id}</p>
        <p className="text-gray-400">Total Lessons: {data.totalLessons}</p>
        <p className="text-gray-400">Lessons with Parts: {data.lessonsWithParts}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Lessons:</h2>
        {data.lessons?.map((lesson, idx) => (
          <div key={lesson.id} className="bg-gray-700 p-4 rounded-lg">
            <div className="font-bold">
              [{idx}] Lesson ID: {lesson.id} | Order: {lesson.order_index} | Title: {lesson.title}
            </div>
            <div className="text-sm text-gray-300 mt-2">
              Type: {lesson.type} | Published: {lesson.is_published ? 'Yes' : 'No'}
            </div>
            {lesson.parts && Array.isArray(lesson.parts) ? (
              <div className="text-sm text-green-400 mt-2">
                ✅ Parts: {lesson.parts.length}
                <div className="mt-1 ml-4">
                  {lesson.parts.map((part, pIdx) => (
                    <div key={pIdx}>
                      Level {part.level}: {part.title}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-400 mt-2">❌ No parts</div>
            )}
            <div className="text-xs text-gray-400 mt-2">
              Created: {lesson.created_at}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Test URLs:</h2>
        <div className="space-y-2">
          {data.lessons?.map((lesson) =>
            lesson.parts?.map((part, pIdx) => (
              <div key={`${lesson.id}-${pIdx}`} className="bg-gray-700 p-2 rounded">
                <a
                  href={`/learn/1/lesson/${lesson.order_index}/level/${pIdx}`}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  /learn/1/lesson/{lesson.order_index}/level/{pIdx} → {lesson.title} - {part.title}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
