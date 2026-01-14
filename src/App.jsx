import React, { useState, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD/HUD';
import MainMenu from './components/Menu/MainMenu';
import GameOver from './components/Menu/GameOver';
import './index.css';

const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAMEOVER: 'GAMEOVER'
};

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [playerName, setPlayerName] = useState('');
  const [currentScore, setCurrentScore] = useState(0);
  const [engineData, setEngineData] = useState(null);
  
  const engineRef = useRef(null);

  const handleStart = (name) => {
    setPlayerName(name);
    setGameState(GAME_STATES.PLAYING);
  };

  const handleGameOver = useCallback((score) => {
    setCurrentScore(score);
    setGameState(GAME_STATES.GAMEOVER);
  }, []);

  const handleUpdateUI = useCallback((data) => {
    setEngineData(data);
  }, []);

  const handleRestart = () => {
    setGameState(GAME_STATES.MENU);
  };

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {gameState === GAME_STATES.MENU && (
        <MainMenu onStart={handleStart} />
      )}

      {gameState === GAME_STATES.PLAYING && (
        <>
          <GameCanvas 
            playerName={playerName} 
            onGameOver={handleGameOver} 
            onUpdateUI={handleUpdateUI}
            engineRef={engineRef}
          />
          <HUD gameState={engineData} />
        </>
      )}

      {gameState === GAME_STATES.GAMEOVER && (
        <GameOver score={currentScore} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
