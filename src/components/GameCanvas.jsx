import { useEffect, useRef } from 'react';
import { Engine } from '../game/Engine';

const GameCanvas = ({ onGameOver, onUpdateUI, playerName, engineRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const engine = new Engine(canvas);
      engine.onGameOver = onGameOver;
      engine.onUpdateUI = onUpdateUI;
      engineRef.current = engine;
      
      engine.start(playerName);
      
      return () => {
        engine.running = false;
      };
    }
  }, [playerName, onGameOver, onUpdateUI, engineRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        cursor: 'none'
      }}
    />
  );
};

export default GameCanvas;
