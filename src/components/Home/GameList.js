import React from 'react';
import GameCard from './GameCard';
import './GameList.css';

const GameList = ({ games }) => {
  return (
    <div className="game-list">
      {games.map(game => (
        <GameCard key={game.gameName} {...game} />
      ))}
    </div>
  );
};

export default GameList;
