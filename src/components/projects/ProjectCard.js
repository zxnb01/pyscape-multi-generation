import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const { id, title, description, difficulty, xp, status, keywords } = project;
  
  // Define difficulty level colors
  const difficultyColors = {
    'Easy': 'bg-green-700/30 text-green-400',
    'Medium': 'bg-yellow-700/30 text-yellow-400',
    'Hard': 'bg-red-700/30 text-red-400'
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-lg">{title}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
              +{xp} XP
            </span>
          </div>
        </div>
        
        {status === 'locked' && (
          <div className="bg-dark text-gray-500 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>
      
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {keywords.map((keyword, index) => (
            <span 
              key={index}
              className="text-xs bg-dark-lightest px-2 py-1 rounded"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
      
      {status === 'available' ? (
        <Link 
          to={`/app/projects/${id}`} 
          className="btn-primary w-full text-center"
        >
          Start Project
        </Link>
      ) : (
        <button 
          className="w-full py-2 px-4 rounded-md bg-dark-lightest text-gray-500 cursor-not-allowed"
          disabled
        >
          Locked
        </button>
      )}
    </div>
  );
};

export default ProjectCard;
