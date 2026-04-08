import React from 'react';
import { Link } from 'react-router-dom';

const CodeDuelPreview = () => {
  const leaderboard = [
    { rank: 1, username: '@code_ninja', points: 2450 },
    { rank: 2, username: '@algo_queen', points: 2310 },
    { rank: 3, username: '@py_master', points: 2100 }
  ];

  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="text-primary mr-2">⚔️</span> Code Duel
        </h2>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Real-time Coding Battles</h3>
        <p className="text-sm text-gray-400">Challenge others and climb the leaderboard.</p>
      </div>
      
      <Link to="/app/duel" className="btn-primary block text-center mb-6">
        Find a Match
      </Link>
      
      <div>
        <h3 className="font-medium mb-3">Leaderboard</h3>
        <div className="space-y-2">
          {leaderboard.map(player => (
            <div 
              key={player.rank} 
              className="bg-dark-lightest rounded-md p-3 flex justify-between items-center"
            >
              <div className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-dark-lighter mr-3">
                  {player.rank}
                </span>
                <span>{player.username}</span>
              </div>
              <div className="text-primary-light font-mono">{player.points} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeDuelPreview;
