import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '../components/projects/ProjectCard';
import { fetchProjects, projects as fallbackProjects } from '../data/projectsData';

const ProjectLabs = () => {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data.map(p => ({ ...p, description: p.description || p.tagline })));
      } catch {
        setProjects(fallbackProjects.map(p => ({ ...p, description: p.description || p.tagline })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  
  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.category === filter);
  
  const categories = ['all', ...new Set(projects.map(project => project.category))];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-40 bg-dark-lighter rounded animate-pulse mb-2" />
          <div className="h-4 w-80 bg-dark-lighter rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 w-3/4 bg-dark-lightest rounded mb-3" />
              <div className="h-4 w-full bg-dark-lightest rounded mb-4" />
              <div className="h-10 w-full bg-dark-lightest rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
