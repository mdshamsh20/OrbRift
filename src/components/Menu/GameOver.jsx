import React from 'react';

const GameOver = ({ score, onRestart }) => {
  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(3, 3, 11, 0.9)',
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div className="glass" style={{
        padding: '50px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 className="title-display" style={{ color: 'var(--color-danger)', fontSize: '32px', marginBottom: '10px' }}>ENTITY COLLAPSED</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '30px' }}>Your energy has been dispersed into the rift.</p>
        
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Final Score</div>
          <div className="text-glow" style={{ fontSize: '48px', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-display)' }}>{score}</div>
        </div>

        <button onClick={onRestart} className="btn-primary" style={{ width: '100%' }}>
          RESPAWN
        </button>
      </div>
    </div>
  );
};

export default GameOver;
