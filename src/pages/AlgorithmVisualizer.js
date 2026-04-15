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
  { id: 'kmeans', label: 'K-Means', icon: '📊' },
  { id: 'gradient', label: 'Gradient Descent', icon: '📉' },
  { id: 'neural', label: 'Neural Network', icon: '🧠' },
  { id: 'sorting', label: 'Sorting', icon: '🔢' },
  { id: 'pathfinding', label: 'Pathfinding', icon: '🧭' },
  { id: 'dataStructure', label: 'Data Structures', icon: '🌳' },
];

export default function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState('kmeans');

  return (
    <div className="w-full h-full flex flex-col gap-4">

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-dark-lightest text-gray-300 hover:bg-dark'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 items-stretch">

        {/* LEFT PANEL */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="card overflow-hidden h-full flex flex-col justify-between min-h-[600px]"
        >
          {activeTab === 'kmeans' && <KMeansVisualizer />}
          {activeTab === 'gradient' && <GradientDescentVisualizer />}
          {activeTab === 'neural' && <NeuralNetworkVisualizer />}
          {activeTab === 'sorting' && <SortingVisualizer />}
          {activeTab === 'pathfinding' && <PathfindingVisualizer />}
          {activeTab === 'dataStructure' && <DataStructureVisualizer />}
        </motion.div>

        {/* RIGHT PANEL */}
        <div className="h-full flex min-h-[600px]">
          <div className="card h-full w-full flex flex-col">
            <TheoryCard activeTab={activeTab} />
          </div>
        </div>

      </div>
    </div>
  );
}