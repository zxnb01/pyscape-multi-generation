import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SortingVisualizer from '../components/visualizer/SortingVisualizer';
import PathfindingVisualizer from '../components/visualizer/PathfindingVisualizer';
import DataStructureVisualizer from '../components/visualizer/DataStructureVisualizer';
import KMeansVisualizer from '../components/visualizer/KMeansVisualizer';
import GradientDescentVisualizer from '../components/visualizer/GradientDescentVisualizer';
import NeuralNetworkVisualizer from '../components/visualizer/NeuralNetworkVisualizer';
import TheoryCard from '../components/visualizer/TheoryCard';

const tabs = [
  {
    id: 'kmeans',
    label: 'K-Means Clustering',
    icon: '⬡',
    badge: 'ML',
    badgeColor: 'bg-primary/20 text-primary',
  },
  {
    id: 'gradient',
    label: 'Gradient Descent',
    icon: '📉',
    badge: 'ML',
    badgeColor: 'bg-primary/20 text-primary',
  },
  {
    id: 'neural',
    label: 'Neural Network',
    icon: '🧠',
    badge: 'ML',
    badgeColor: 'bg-primary/20 text-primary',
  },
  {
    id: 'sorting',
    label: 'Sorting',
    icon: '⇅',
    badge: 'CS',
    badgeColor: 'bg-dark-lightest text-gray-400',
  },
  {
    id: 'pathfinding',
    label: 'Pathfinding',
    icon: '🗺',
    badge: 'CS',
    badgeColor: 'bg-dark-lightest text-gray-400',
  },
  {
    id: 'dataStructure',
    label: 'Data Structures',
    icon: '🌳',
    badge: 'CS',
    badgeColor: 'bg-dark-lightest text-gray-400',
  },
];

const descriptions = {
  kmeans:      'Watch K-Means live: points get assigned to their nearest centroid, then centroids move to the mean of their cluster — repeat until convergence.',
  gradient:    'See a "ball" roll down a loss surface step-by-step. Adjust learning rate and watch how it affects convergence speed and oscillation.',
  neural:      'Drag input sliders and fire a forward pass through a fully-connected network. Watch activations light up layer by layer.',
  sorting:     'Visualise bubble, merge and quick sort step-by-step on random arrays.',
  pathfinding: 'Dijkstra\'s and A* pathfinding on an interactive grid — coming soon.',
  dataStructure: 'Interact with stacks, queues and trees — coming soon.',
};

const AlgorithmVisualizer = () => {
  const [activeTab, setActiveTab] = useState('kmeans');

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-2">ML Visualizer</h1>
        <p className="text-gray-400">
          Interactive visualizations for core ML concepts — see algorithms run step-by-step.
        </p>
      </motion.div>

      {/* tab bar */}
      <div className="mb-5 overflow-x-auto">
        <div className="flex gap-1 border-b border-dark-lightest min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-white font-semibold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ml-0.5 ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* description */}
      <motion.p
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-400 mb-4"
      >
        {descriptions[activeTab]}
      </motion.p>

      {/* two-column layout: visualizer left, theory panel right */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-start">

        {/* visualizer card */}
        <motion.div
          key={activeTab + '-card'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="card overflow-hidden"
        >
          {activeTab === 'kmeans'        && <KMeansVisualizer />}
          {activeTab === 'gradient'      && <GradientDescentVisualizer />}
          {activeTab === 'neural'        && <NeuralNetworkVisualizer />}
          {activeTab === 'sorting'       && <SortingVisualizer />}
          {activeTab === 'pathfinding'   && <PathfindingVisualizer />}
          {activeTab === 'dataStructure' && <DataStructureVisualizer />}
        </motion.div>

        {/* theory / academic panel */}
        <TheoryCard activeTab={activeTab} />

      </div>
    </div>
  );
};

export default AlgorithmVisualizer;
