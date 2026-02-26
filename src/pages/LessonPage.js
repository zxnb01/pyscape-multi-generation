import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

// Redirect straight to level 1 — LevelPage holds all real lesson content
const LessonPage = () => {
  const { moduleId, lessonId } = useParams();
  return <Navigate to={`/app/learn/${moduleId}/lesson/${lessonId}/level/1`} replace />;
};

export default LessonPage;

