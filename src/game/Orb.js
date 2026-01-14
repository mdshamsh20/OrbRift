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

        this.velocity = VELOCITY_BASE;
        this.nodes = [];
        this.numNodes = 12;
        this.initNodes();

        this.isDashing = false;
        this.dashTimer = 0;

        this.shieldActive = false;
        this.shieldTimer = 0;

        this.score = 0;
        this.kills = 0;
        this.alive = true;
        this.level = 1;
        this.evolutionTier = 0;
    }

    initNodes() {
        for (let i = 0; i < this.numNodes; i++) {
            const angle = (i / this.numNodes) * Math.PI * 2;
            this.nodes.push({
                angle: angle,
                distance: this.radius * 0.8,
                x: this.x,
                y: this.y,
                phase: Math.random() * Math.PI * 2
            });
        }
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

        if (dist > 5) {
            const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            const moveDist = currentVelocity * (dt / 16.67); // Normalized to 60fps

            this.x += Math.cos(angle) * moveDist;
            this.y += Math.sin(angle) * moveDist;
        }

        // Keep within bounds
        this.x = clamp(this.x, 0, MAP_SIZE);
        this.y = clamp(this.y, 0, MAP_SIZE);

        // Update radius based on mass
        this.radius = massToRadius(this.mass);

        // Update nodes for cosmic effect
        const time = Date.now() / 1000;
        this.nodes.forEach((node, i) => {
            node.angle += 0.02;
            node.distance = lerp(node.distance, this.radius * (0.9 + Math.sin(time * 2 + i) * 0.1), 0.1);

            const targetX = this.x + Math.cos(node.angle) * node.distance;
            const targetY = this.y + Math.sin(node.angle) * node.distance;

            node.x = lerp(node.x, targetX, 0.2);
            node.y = lerp(node.y, targetY, 0.2);
        });

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

        // Draw nodes/connections
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const nextNode = this.nodes[(i + 1) % this.nodes.length];

            if (i === 0) ctx.moveTo(node.x - camera.x, node.y - camera.y);
            else ctx.lineTo(node.x - camera.x, node.y - camera.y);
        }
        ctx.closePath();
        ctx.stroke();

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

        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.radius);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner glow
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.3;
        ctx.fill();

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
