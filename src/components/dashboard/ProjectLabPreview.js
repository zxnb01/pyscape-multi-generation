import React from 'react';
import { Link } from 'react-router-dom';

const ProjectLabPreview = () => {
  const projects = [
    {
      id: 1,
      title: 'Sentiment Analyzer',
      difficulty: 'Easy',
      xp: '+50 XP',
      status: 'available'
    },
    {
      id: 2,
      title: 'Image Classifier (CIFAR-10)',
      difficulty: 'Medium',
      xp: '+150 XP',
      status: 'locked'
    },
    {
      id: 3,
      title: 'Predict Stock Prices',
      difficulty: 'Hard',
      xp: '+300 XP',
      status: 'locked'
    }
  ];

  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="text-primary mr-2">🏆</span> Project Lab
        </h2>
        <Link to="/app/projects" className="text-primary hover:text-primary-light text-sm">View all</Link>
      </div>
      
      <div className="space-y-3">
        {projects.map(project => (
          <div 
            key={project.id} 
            className={`bg-dark-lightest rounded-md p-4 flex justify-between items-center ${
              project.status === 'locked' ? 'opacity-60' : ''
            }`}
          >
            <div>
              <h3 className="font-medium">{project.title}</h3>
              <div className="flex items-center mt-1 text-sm">
                <span className="text-gray-400">{project.difficulty}</span>
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-accent">{project.xp}</span>
              </div>
            </div>
            
            <div>
              {project.status === 'available' ? (
                <Link 
                  to={`/app/projects/${project.id}`} 
                  className="btn-primary py-1 px-3 text-sm"
                >
                  Start
                </Link>
              ) : (
                <button className="bg-dark text-gray-500 py-1 px-3 rounded-md text-sm" disabled>
                  Locked
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectLabPreview;
