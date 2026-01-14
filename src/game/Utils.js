export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randomFloat = (min, max) => Math.random() * (max - min) + min;

export const distance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const distanceSq = (x1, y1, x2, y2) => {
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
};

export const lerp = (a, b, t) => a + (b - a) * t;

export const massToRadius = (mass) => {
    return Math.sqrt(mass * 20); // Scale for visual representation
};

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
