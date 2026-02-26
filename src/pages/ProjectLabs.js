import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '../components/projects/ProjectCard';
import { projects as allProjects } from '../data/projectsData';

const ProjectLabs = () => {
  const [filter, setFilter] = useState('all');

  // normalise: ProjectCard expects `description`, data has `tagline`
  const projects = allProjects.map(p => ({
    ...p,
    description: p.description || p.tagline,
  }));
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category === filter);
  
  const categories = ['all', ...new Set(projects.map(project => project.category))];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-2">Project Labs</h1>
        <p className="text-gray-400">
          Build guided projects to apply your skills and compare algorithm performance.
        </p>
      </motion.div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`py-1 px-3 rounded-full text-sm ${
                filter === category
                  ? 'bg-primary text-white'
                  : 'bg-dark-lightest text-gray-300 hover:bg-dark-lighter'
              }`}
              onClick={() => setFilter(category)}
            >
              {category === 'all' ? 'All Projects' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectLabs;
