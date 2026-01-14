import { massToRadius, distance, lerp, clamp } from './Utils';
import { VELOCITY_BASE, VELOCITY_MIN, MAP_SIZE, INITIAL_MASS } from './Constants';

export class Orb {
    constructor(id, x, y, mass, color, name, isPlayer = false) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.radius = massToRadius(mass);
        this.color = color;
        this.name = name;
        this.isPlayer = isPlayer;

        this.targetX = x;
        this.targetY = y;
        this.isDashing = false;
        this.dashTimer = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;

        this.score = 0;
        this.kills = 0;
        this.alive = true;
        this.level = 1;
        this.evolutionTier = 0;

        this.trail = [];
        this.maxTrailLength = 20;
    }


    update(dt, mouseX, mouseY, camera) {
        if (!this.alive) return;

        if (this.isPlayer) {
            this.targetX = mouseX + camera.x;
            this.targetY = mouseY + camera.y;
        }

        const dist = distance(this.x, this.y, this.targetX, this.targetY);

        // Calculate speed based on mass (larger = slower but less severe now)
        let currentVelocity = VELOCITY_BASE * (12 / Math.pow(this.mass, 0.35));
        currentVelocity = Math.max(currentVelocity, VELOCITY_MIN);

        if (this.isDashing) {
            currentVelocity *= 2.5;
            this.dashTimer -= dt;
            if (this.dashTimer <= 0) this.isDashing = false;
        }

        // Fix Jitter: Use a larger dead zone and smooth interpolation
        if (dist > 5) {
            const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            let moveDist = currentVelocity * (dt / 16.67);

            // Smooth arrival if close to target
            if (dist < 100) {
                moveDist *= (dist / 100);
            }

            // Prevent overshooting
            if (moveDist > dist) moveDist = dist;

            this.x += Math.cos(angle) * moveDist;
            this.y += Math.sin(angle) * moveDist;
        }

        // Keep within bounds
        this.x = clamp(this.x, 0, MAP_SIZE);
        this.y = clamp(this.y, 0, MAP_SIZE);

        // Update radius based on mass
        this.radius = massToRadius(this.mass);

        // Update trail for comet effect
        this.maxTrailLength = Math.floor(10 + Math.sqrt(this.mass) * 2);
        this.trail.unshift({ x: this.x, y: this.y, r: this.radius });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }

        if (this.shieldActive) {
            this.shieldTimer -= dt;
            if (this.shieldTimer <= 0) this.shieldActive = false;
        }

        // Logic for "Predator Glow" (visual feedback for killing)
        this.nearbyPrey = false;
    }

    setNearbyPrey(value) {
        this.nearbyPrey = value;
    }

    draw(ctx, camera) {
        if (!this.alive) return;

        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Draw Comet Trail
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 0; i < this.trail.length - 1; i++) {
                const point = this.trail[i];
                const nextPoint = this.trail[i + 1];
                const ratio = 1 - (i / this.trail.length);

                ctx.globalAlpha = ratio * 0.5;
                ctx.lineWidth = point.r * 1.8 * ratio;
                ctx.strokeStyle = this.color;

                ctx.beginPath();
                ctx.moveTo(point.x - camera.x, point.y - camera.y);
                ctx.lineTo(nextPoint.x - camera.x, nextPoint.y - camera.y);
                ctx.stroke();
            }
        }

        // Draw Shield
        if (this.shieldActive) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius * 1.3, 0, Math.PI * 2);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Draw Core
        ctx.globalAlpha = 1.0;

        // Predator Glow if near prey (Optimized: No shadowBlur)
        if (this.nearbyPrey && this.isPlayer) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
            ctx.fill();
        }

        // Draw Core Nucleus
        ctx.globalAlpha = 1.0;
        const nucleusGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.radius);
        nucleusGrad.addColorStop(0, '#fff');
        nucleusGrad.addColorStop(0.2, '#fff');
        nucleusGrad.addColorStop(0.5, this.color);
        nucleusGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = nucleusGrad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // High-energy particles around head
        if (this.isDashing) {
            for (let i = 0; i < 3; i++) {
                const offX = (Math.random() - 0.5) * this.radius * 2;
                const offY = (Math.random() - 0.5) * this.radius * 2;
                ctx.beginPath();
                ctx.arc(screenX + offX, screenY + offY, this.radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.4;
                ctx.fill();
            }
        }

        // Draw Name
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(12, this.radius * 0.4)}px Orbitron`;
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX, screenY - this.radius - 10);
    }

    eat(mass) {
        this.mass += mass;
        this.score += Math.floor(mass * 10);

        // Level up logic
        const nextLevelMass = 20 * Math.pow(1.5, this.level - 1);
        if (this.mass >= nextLevelMass) {
            this.level++;
            if (this.level % 5 === 0) {
                this.evolutionTier++;
            }
            return true; // Leveled up
        }
        return false;
    }
}
