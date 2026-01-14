import React from 'react';

const HUD = ({ gameState }) => {
  if (!gameState) return null;

  const { score, mass, level, evolution, leaderboard, cooldowns } = gameState;

  const nextLevelMass = 20 * Math.pow(1.5, (level || 1) - 1);
  const prevLevelMass = level > 1 ? 20 * Math.pow(1.5, level - 2) : 0;
  const progressRatio = (mass - prevLevelMass) / (nextLevelMass - prevLevelMass);

  return (
    <div className="hud-overlay" style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      color: 'white',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 10
    }}>
      {/* Top Section: Leaderboard & Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="glass" style={{ padding: '15px', minWidth: '220px' }}>
          <h3 className="title-display" style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--color-primary)' }}>Leaderboard</h3>
          {leaderboard.map((entry, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', opacity: i === 0 ? 1 : 0.7 }}>
              <span>{i + 1}. {entry.name}</span>
              <span style={{ fontWeight: 'bold' }}>{entry.mass}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="glass" style={{ padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }}>Tier</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-secondary)' }}>{evolution || 0}</div>
            </div>
            <div className="glass" style={{ padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }}>Level</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--color-primary)' }}>{level || 1}</div>
            </div>
          </div>
          
          <div className="glass" style={{ padding: '15px', width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
              <span>PROGRESION</span>
              <span>{Math.floor(progressRatio * 100)}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressRatio * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', transition: 'width 0.3s' }} />
            </div>
          </div>

          <div className="glass" style={{ padding: '12px 20px', textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'var(--font-display)', color: 'var(--color-energy)' }}>{score}</div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6 }}>Total Energy</div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Abilities */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <AbilityIcon 
          name="Dash" 
          keybind="SPACE" 
          cooldown={cooldowns.dash} 
          maxCooldown={5000} 
          color="var(--color-primary)" 
        />
        <AbilityIcon 
          name="Shield" 
          keybind="E" 
          cooldown={cooldowns.shield} 
          maxCooldown={15000} 
          color="var(--color-secondary)" 
        />
        <AbilityIcon 
          name="Split" 
          keybind="Q" 
          cooldown={cooldowns.split} 
          maxCooldown={1000} 
          color="#00ff00" 
        />
        <AbilityIcon 
          name="Pull" 
          keybind="R" 
          cooldown={cooldowns.gravity} 
          maxCooldown={20000} 
          color="var(--color-energy)" 
          disabled
        />
      </div>
    </div>
  );
};

const AbilityIcon = ({ name, keybind, cooldown, maxCooldown, color, disabled }) => {
  const percent = cooldown > 0 ? (cooldown / maxCooldown) * 100 : 0;
  
  return (
    <div className="glass" style={{ 
      width: '70px', 
      height: '70px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      opacity: disabled ? 0.3 : 1,
      border: `1px solid ${percent > 0 ? '#333' : color}`
    }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>{name}</div>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '900', 
        color: percent > 0 ? '#666' : color,
        textShadow: percent > 0 ? 'none' : `0 0 10px ${color}`
      }}>{keybind}</div>
      
      {percent > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: `${percent}%`,
          background: 'rgba(255,255,255,0.1)',
          transition: 'height 0.1s linear'
        }} />
      )}
    </div>
  );
};

export default HUD;
