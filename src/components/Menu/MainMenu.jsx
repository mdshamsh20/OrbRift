import React, { useState } from 'react';

const MainMenu = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name);
    } else {
      onStart('Unidentified Orb');
    }
  };

  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0a0a2f 0%, #03030b 100%)',
      zIndex: 100,
      fontFamily: 'var(--font-main)'
    }}>
      {/* Decorative Orbs */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'var(--color-primary)',
        filter: 'blur(100px)',
        opacity: 0.2,
        top: '20%',
        left: '20%'
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'var(--color-secondary)',
        filter: 'blur(120px)',
        opacity: 0.15,
        bottom: '10%',
        right: '15%'
      }} />

      <div className="glass" style={{
        padding: '50px',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center',
        paddingTop: '60px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '3px solid var(--color-primary)',
          boxShadow: '0 0 30px var(--color-primary-glow)',
          background: '#03030b'
        }}>
          <img src="/logo.png" alt="OrbRift.io Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 className="title-display text-glow" style={{
          fontSize: '48px',
          fontWeight: '900',
          marginBottom: '5px',
          color: 'var(--color-primary)'
        }}>ORBRIFT</h1>
        <p style={{ 
          fontSize: '12px', 
          color: 'var(--color-text-muted)', 
          letterSpacing: '4px', 
          marginBottom: '40px',
          textTransform: 'uppercase'
        }}>Cosmic Entity Survival <span style={{ color: 'var(--color-secondary)', opacity: 0.6 }}>v1.0.4</span></p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="ENTER ENTITY NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass"
              style={{
                width: '100%',
                padding: '20px',
                textAlign: 'center',
                fontSize: '18px',
                fontFamily: 'var(--font-display)',
                color: '#fff',
                outline: 'none',
                border: '1px solid var(--color-primary-glow)',
                borderRadius: '12px'
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 0 15px var(--color-primary-glow)',
              pointerEvents: 'none',
              opacity: 0.3
            }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '18px' }}>
            EVOLVE NOW
          </button>
        </form>

        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="glass" style={{ padding: '15px', fontSize: '11px', opacity: 0.8 }}>
            <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '5px' }}>MOVEMENT</div>
            MOUSE TO STEER
          </div>
          <div className="glass" style={{ padding: '15px', fontSize: '11px', opacity: 0.8 }}>
            <div style={{ color: 'var(--color-secondary)', fontWeight: 'bold', marginBottom: '5px' }}>DASH</div>
            SPACEBAR
          </div>
          <div className="glass" style={{ padding: '15px', fontSize: '11px', opacity: 0.8 }}>
            <div style={{ color: '#00ff00', fontWeight: 'bold', marginBottom: '5px' }}>SHIELD</div>
            E KEY
          </div>
          <div className="glass" style={{ padding: '15px', fontSize: '11px', opacity: 0.8 }}>
            <div style={{ color: 'var(--color-energy)', fontWeight: 'bold', marginBottom: '5px' }}>GROW</div>
            COLLECT ENERGY
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
