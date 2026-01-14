import { Orb } from './Orb';
import { randomInt, distance } from './Utils';
import { MAP_SIZE } from './Constants';

export class Bot extends Orb {
    constructor(id, x, y, mass, color, name) {
        super(id, x, y, mass, color, name, false);
        this.changeDirTimer = 0;
        this.decisionTimer = 0;
    }

    update(dt, foods, orbs, camera) {
        this.decisionTimer -= dt;

        if (this.decisionTimer <= 0) {
            this.decisionTimer = 500 + Math.random() * 1000;

            // Look for food or small players
            let nearestFood = null;
            let minDist = 500;

            foods.forEach(food => {
                const d = distance(this.x, this.y, food.x, food.y);
                if (d < minDist) {
                    minDist = d;
                    nearestFood = food;
                }
            });

            if (nearestFood) {
                this.targetX = nearestFood.x;
                this.targetY = nearestFood.y;
            } else {
                // Random movement if no food nearby
                if (this.changeDirTimer <= 0) {
                    this.targetX = randomInt(0, MAP_SIZE);
                    this.targetY = randomInt(0, MAP_SIZE);
                    this.changeDirTimer = 3000 + Math.random() * 5000;
                }
            }

            // Avoid larger orbs
            orbs.forEach(orb => {
                if (orb.id !== this.id && orb.alive && orb.mass > this.mass * 1.2) {
                    const d = distance(this.x, this.y, orb.x, orb.y);
                    if (d < 300) {
                        // Run away!
                        const angle = Math.atan2(this.y - orb.y, this.x - orb.x);
                        this.targetX = this.x + Math.cos(angle) * 500;
                        this.targetY = this.y + Math.sin(angle) * 500;
                    }
                }
            });
        }

        this.changeDirTimer -= dt;
        super.update(dt, 0, 0, camera);
    }
}
