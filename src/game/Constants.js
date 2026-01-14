export const MAP_SIZE = 4000;
export const INITIAL_MASS = 20;
export const MAX_MASS = 1000;
export const GROWTH_FACTOR = 0.5;

export const VELOCITY_BASE = 5;
export const VELOCITY_MIN = 2;

export const FOOD_COUNT = 250;
export const BOT_COUNT = 15;

export const FOOD_MASS = 1.5;
export const BOT_INITIAL_MASS = 20;

export const PARTICLE_COUNT = 50;

export const ABILITIES = {
    DASH: {
        name: 'Dash Burst',
        cooldown: 5000,
        duration: 500,
        multiplier: 2.5,
    },
    SPLIT: {
        name: 'Orb Split',
        cooldown: 1000,
        min_mass: 40,
    },
    SHIELD: {
        name: 'Shield Pulse',
        cooldown: 15000,
        duration: 3000,
    },
    GRAVITY: {
        name: 'Gravity Pull',
        cooldown: 20000,
        duration: 5000,
        radius: 300,
    }
};

export const COLORS = {
    ENERGY: '#f0ff00',
    PLAYER_CORE: '#00f2ff',
    PLAYER_TRAIL: '#7000ff',
    BOT_CORES: ['#ff00ff', '#ff3e3e', '#00ff00', '#ff8800', '#0088ff'],
    PARTICLES: ['#00f2ff', '#ff00ff', '#7000ff', '#ffffff'],
    GRID_LINES: 'rgba(255, 255, 255, 0.05)',
    BACKGROUND: '#03030b',
};
