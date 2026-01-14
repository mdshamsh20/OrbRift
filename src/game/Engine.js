import { Orb } from './Orb';
import { Bot } from './Bot';
import { Particle } from './Particle';
import { randomInt, distance, distanceSq, lerp } from './Utils';
import {
    MAP_SIZE, FOOD_COUNT, BOT_COUNT,
    INITIAL_MASS, BOT_INITIAL_MASS,
    FOOD_MASS, COLORS, ABILITIES
} from './Constants';

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera = { x: 0, y: 0, zoom: 1 };

        this.player = null;
        this.orbs = [];
        this.foods = [];
        this.particles = [];
        this.hazards = [];

        this.lastTime = 0;
        this.running = false;

        this.mouseX = 0;
        this.mouseY = 0;

        this.cooldowns = {
            dash: 0,
            split: 0,
            shield: 0,
            gravity: 0
        };

        this.onGameOver = null;
        this.onUpdateUI = null;

        this.init();
        this.setupListeners();
    }

    init() {
        this.foods = [];
        for (let i = 0; i < FOOD_COUNT; i++) {
            this.spawnFood();
        }

        this.hazards = [];
        for (let i = 0; i < 5; i++) {
            this.hazards.push({
                x: randomInt(500, MAP_SIZE - 500),
                y: randomInt(500, MAP_SIZE - 500),
                radius: randomInt(100, 250),
                pulse: 0
            });
        }
    }

    start(playerName) {
        this.player = new Orb(
            'player',
            MAP_SIZE / 2,
            MAP_SIZE / 2,
            INITIAL_MASS,
            COLORS.PLAYER_CORE,
            playerName,
            true
        );

        this.orbs = [this.player];
        this.particles = [];

        for (let i = 0; i < BOT_COUNT; i++) {
            this.spawnBot();
        }

        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    spawnFood() {
        this.foods.push({
            x: randomInt(0, MAP_SIZE),
            y: randomInt(0, MAP_SIZE),
            color: COLORS.ENERGY,
            size: 3 + Math.random() * 3
        });
    }

    spawnBot() {
        const color = COLORS.BOT_CORES[randomInt(0, COLORS.BOT_CORES.length - 1)];
        const id = `bot_${Math.random().toString(36).substr(2, 9)}`;
        const bot = new Bot(
            id,
            randomInt(0, MAP_SIZE),
            randomInt(0, MAP_SIZE),
            BOT_INITIAL_MASS + Math.random() * 20,
            color,
            `Bot_${id.substr(4, 4)}`
        );
        this.orbs.push(bot);
    }

    setupListeners() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('keydown', (e) => {
            if (!this.player || !this.player.alive) return;

            if (e.code === 'Space') this.useAbility('dash');
            if (e.code === 'KeyQ') this.useAbility('split');
            if (e.code === 'KeyE') this.useAbility('shield');
            if (e.code === 'KeyR') this.useAbility('gravity');
        });
    }

    useAbility(type) {
        if (this.cooldowns[type] > 0) return;

        switch (type) {
            case 'dash':
                this.player.isDashing = true;
                this.player.dashTimer = ABILITIES.DASH.duration;
                this.cooldowns.dash = ABILITIES.DASH.cooldown;
                break;
            case 'shield':
                this.player.shieldActive = true;
                this.player.shieldTimer = ABILITIES.SHIELD.duration;
                this.cooldowns.shield = ABILITIES.SHIELD.cooldown;
                break;
            case 'split':
                if (this.player.mass >= ABILITIES.SPLIT.min_mass) {
                    this.player.mass /= 1.5;
                    this.cooldowns.split = ABILITIES.SPLIT.cooldown;
                    // Create a burst of mass particles
                    for (let i = 0; i < 10; i++) {
                        this.particles.push(new Particle(this.player.x, this.player.y, this.player.color));
                    }
                }
                break;
        }
    }

    gameLoop(time) {
        if (!this.running) return;

        const dt = time - this.lastTime;
        this.lastTime = time;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(dt) {
        // Update cooldowns
        for (let key in this.cooldowns) {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] -= dt;
            }
        }

        // Camera follow player
        if (this.player && this.player.alive) {
            this.camera.x = lerp(this.camera.x, this.player.x - this.width / 2, 0.1);
            this.camera.y = lerp(this.camera.y, this.player.y - this.height / 2, 0.1);
        }

        // Update hazards
        this.hazards.forEach(h => {
            h.pulse += 0.05;
        });

        // Update orbs
        this.orbs.forEach(orb => {
            if (orb instanceof Bot) {
                orb.update(dt, this.foods, this.orbs, this.camera);
            } else {
                orb.update(dt, this.mouseX, this.mouseY, this.camera);
            }

            // Check hazards
            this.hazards.forEach(h => {
                if (distanceSq(orb.x, orb.y, h.x, h.y) < Math.pow(h.radius + orb.radius, 2)) {
                    if (!orb.shieldActive) {
                        orb.mass *= 0.995; // Damage over time
                        if (orb.isPlayer && Math.random() < 0.1) {
                            this.particles.push(new Particle(orb.x, orb.y, '#ff0000'));
                        }
                    }
                }
            });
        });

        // Food collision
        this.orbs.forEach(orb => {
            if (!orb.alive) return;

            for (let i = this.foods.length - 1; i >= 0; i--) {
                const food = this.foods[i];
                if (distanceSq(orb.x, orb.y, food.x, food.y) < Math.pow(orb.radius + food.size, 2)) {
                    const leveledUp = orb.eat(FOOD_MASS);
                    if (orb.isPlayer) {
                        this.particles.push(new Particle(food.x, food.y, food.color));
                        if (leveledUp) {
                            // Level up burst
                            for (let k = 0; k < 10; k++) {
                                this.particles.push(new Particle(orb.x, orb.y, COLORS.PLAYER_CORE));
                            }
                        }
                    }
                    this.foods.splice(i, 1);
                    this.spawnFood();
                }
            }
        });

        // Orb collision (Combat)
        for (let i = 0; i < this.orbs.length; i++) {
            const orbA = this.orbs[i];
            if (!orbA.alive) continue;

            for (let j = i + 1; j < this.orbs.length; j++) {
                const orbB = this.orbs[j];
                if (!orbB.alive) continue;

                const dSq = distanceSq(orbA.x, orbA.y, orbB.x, orbB.y);

                // Detection for "Predator Glow"
                const detectionRangeSq = Math.pow((orbA.radius + orbB.radius) * 2, 2);
                if (dSq < detectionRangeSq) {
                    if (orbA.isPlayer && orbA.mass > orbB.mass * 1.1) orbA.setNearbyPrey(true);
                    if (orbB.isPlayer && orbB.mass > orbA.mass * 1.1) orbB.setNearbyPrey(true);
                }

                if (dSq < Math.pow((orbA.radius + orbB.radius) * 0.8, 2)) {
                    // Shield-based combat: shield acts as a weapon
                    if (orbA.shieldActive && !orbB.shieldActive) {
                        this.eliminate(orbA, orbB);
                    } else if (orbB.shieldActive && !orbA.shieldActive) {
                        this.eliminate(orbB, orbA);
                    } else if (orbA.shieldActive && orbB.shieldActive) {
                        // Both shielded: High energy collision drains both/mutual destruction
                        this.eliminate(orbA, orbB, true);
                        this.eliminate(orbB, orbA, true);
                    } else {
                        // NO SHIELDS: Mutual Destruction!
                        this.eliminate(orbA, orbB, true);
                        this.eliminate(orbB, orbA, true);
                    }
                }
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        if (this.onUpdateUI) {
            this.onUpdateUI({
                score: this.player?.score || 0,
                mass: Math.floor(this.player?.mass || 0),
                level: this.player?.level || 1,
                evolution: this.player?.evolutionTier || 0,
                cooldowns: this.cooldowns,
                leaderboard: this.getLeaderboard()
            });
        }
    }

    eliminate(winner, loser, bypassShield = false) {
        if (!loser.alive) return;
        if (loser.shieldActive && !bypassShield) return; // Shield protects unless bypassed

        // Visual feedback
        for (let i = 0; i < 12; i++) {
            this.particles.push(new Particle(loser.x, loser.y, loser.color));
        }

        winner.eat(loser.mass * 0.5);
        winner.kills++;
        loser.alive = false;

        if (loser.isPlayer) {
            if (this.onGameOver) this.onGameOver(loser.score);
        } else {
            // Respawn bot after delay
            setTimeout(() => {
                const index = this.orbs.indexOf(loser);
                if (index > -1) this.orbs.splice(index, 1);
                this.spawnBot();
            }, 3000);
        }
    }

    getLeaderboard() {
        return this.orbs
            .filter(o => o.alive)
            .sort((a, b) => b.mass - a.mass)
            .slice(0, 10)
            .map(o => ({ name: o.name, mass: Math.floor(o.mass) }));
    }

    draw() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Grid
        this.drawGrid();

        // Draw Map Boundary
        this.drawBoundary();

        // Draw Hazards
        this.hazards.forEach(h => {
            const screenX = h.x - this.camera.x;
            const screenY = h.y - this.camera.y;
            const radius = h.radius + Math.sin(h.pulse) * 10;

            const grad = this.ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
            grad.addColorStop(0, 'rgba(255, 0, 0, 0.2)');
            grad.addColorStop(1, 'rgba(255, 0, 0, 0)');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = 'rgba(255, 0, 80, 0.3)';
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });

        // Draw Food
        this.foods.forEach(food => {
            const screenX = food.x - this.camera.x;
            const screenY = food.y - this.camera.y;

            if (screenX > -10 && screenX < this.width + 10 && screenY > -10 && screenY < this.height + 10) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, food.size, 0, Math.PI * 2);
                this.ctx.fillStyle = food.color;
                this.ctx.fill();
            }
        });

        // Draw Particles
        this.particles.forEach(p => p.draw(this.ctx, this.camera));

        // Draw Orbs (with Culling)
        this.orbs.forEach(orb => {
            const screenX = orb.x - this.camera.x;
            const screenY = orb.y - this.camera.y;
            const padding = orb.radius + 100;

            if (screenX > -padding && screenX < this.width + padding &&
                screenY > -padding && screenY < this.height + padding) {
                orb.draw(this.ctx, this.camera);
            }
        });
    }

    drawGrid() {
        const spacing = 150;
        const startX = -this.camera.x % spacing;
        const startY = -this.camera.y % spacing;

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 242, 255, 0.03)';
        this.ctx.lineWidth = 1;

        for (let x = startX; x < this.width; x += spacing) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        for (let y = startY; y < this.height; y += spacing) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
    }

    drawBoundary() {
        this.ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
        this.ctx.lineWidth = 10;
        this.ctx.strokeRect(-this.camera.x, -this.camera.y, MAP_SIZE, MAP_SIZE);
    }
}
