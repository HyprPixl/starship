// Game State
class GameState {
    constructor() {
        this.money = 0;
        this.bestDistance = 0;
        this.bestHeight = 0;
        this.upgrades = {
            fuel: 0,
            thrust: 0,
            efficiency: 0,
            wings: 0,
            nosecone: 0,
            detector: 0,
            boost: 0,
            luck: 0,
            ramp: 0,
            booster: 0
        };
        this.loadGame();
    }

    saveGame() {
        localStorage.setItem('starship_save', JSON.stringify({
            money: this.money,
            bestDistance: this.bestDistance,
            bestHeight: this.bestHeight,
            upgrades: this.upgrades
        }));
    }

    loadGame() {
        const save = localStorage.getItem('starship_save');
        if (save) {
            const data = JSON.parse(save);
            this.money = data.money || 0;
            this.bestDistance = data.bestDistance || 0;
            this.bestHeight = data.bestHeight || 0;
            this.upgrades = data.upgrades || this.upgrades;
        }
    }

    resetGame() {
        this.money = 0;
        this.bestDistance = 0;
        this.bestHeight = 0;
        this.upgrades = {
            fuel: 0,
            thrust: 0,
            efficiency: 0,
            wings: 0,
            nosecone: 0,
            detector: 0,
            boost: 0,
            luck: 0,
            ramp: 0,
            booster: 0
        };
        this.saveGame();
    }
}

// Upgrade System
class UpgradeSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.upgradeCosts = {
            fuel: 100,
            thrust: 150,
            efficiency: 200,
            wings: 175,
            nosecone: 250,
            detector: 500,
            boost: 600,
            luck: 400,
            ramp: 300,
            booster: 350
        };
    }

    getCost(upgrade) {
        const level = this.gameState.upgrades[upgrade];
        const baseCost = this.upgradeCosts[upgrade];
        return Math.floor(baseCost * Math.pow(1.5, level));
    }

    canAfford(upgrade) {
        return this.gameState.money >= this.getCost(upgrade);
    }

    purchase(upgrade) {
        const cost = this.getCost(upgrade);
        if (this.canAfford(upgrade)) {
            this.gameState.money -= cost;
            this.gameState.upgrades[upgrade]++;
            this.gameState.saveGame();
            return true;
        }
        return false;
    }

    getBonus(upgrade) {
        const level = this.gameState.upgrades[upgrade];
        const bonuses = {
            fuel: level * 20, // +20% fuel per level
            thrust: level * 15, // +15% thrust per level
            efficiency: level * 10, // -10% fuel burn per level
            wings: level * 8, // +8% glide per level
            nosecone: level * 5, // -5% drag per level
            detector: level * 30, // +30 units detection range per level
            boost: level * 15, // +15% boost power per level
            luck: level * 10, // +10% money per level
            ramp: level * 5, // +5 m/s initial speed per level
            booster: level * 10 // +10 m/s initial burst per level
        };
        return bonuses[upgrade] || 0;
    }
}

// Planet (Gravity Well) Class
class Planet {
    constructor(x, y, radius, mass) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.pulsePhase += 0.05;
    }

    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // Draw outer glow effect with multiple layers
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
        
        // Outer glow
        const outerGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.radius * 3);
        outerGradient.addColorStop(0, `rgba(100, 200, 255, ${0.15 * pulse})`);
        outerGradient.addColorStop(0.5, `rgba(80, 160, 255, ${0.08 * pulse})`);
        outerGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = outerGradient;
        ctx.fillRect(screenX - this.radius * 3, screenY - this.radius * 3, 
                     this.radius * 6, this.radius * 6);
        
        // Inner glow
        const innerGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.radius * 1.5);
        innerGradient.addColorStop(0, `rgba(150, 220, 255, ${0.4 * pulse})`);
        innerGradient.addColorStop(0.7, `rgba(100, 180, 255, ${0.2 * pulse})`);
        innerGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = innerGradient;
        ctx.fillRect(screenX - this.radius * 1.5, screenY - this.radius * 1.5, 
                     this.radius * 3, this.radius * 3);
        
        // Draw planet body with gradient
        const planetGradient = ctx.createRadialGradient(
            screenX - this.radius * 0.3, screenY - this.radius * 0.3, 0,
            screenX, screenY, this.radius
        );
        planetGradient.addColorStop(0, '#6699ff');
        planetGradient.addColorStop(0.5, '#4488ff');
        planetGradient.addColorStop(1, '#2266dd');
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(screenX - this.radius * 0.3, screenY - this.radius * 0.3, 
                this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw subtle surface details
        ctx.fillStyle = 'rgba(0, 0, 100, 0.1)';
        ctx.beginPath();
        ctx.arc(screenX + this.radius * 0.2, screenY + this.radius * 0.2, 
                this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Particle System for Thrust Effects
class Particle {
    constructor(x, y, vx, vy, life, size, color, type = 'thrust') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color = color;
        this.alpha = 1;
        this.type = type;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'thrust') {
            this.vy += 0.1; // Gravity on particles
            this.vx *= 0.98; // Air resistance
        } else if (this.type === 'trail') {
            this.vx *= 0.95; // Trail particles slow down faster
            this.vy *= 0.95;
        } else if (this.type === 'smoke') {
            this.vy -= 0.05; // Smoke rises
            this.vx *= 0.97;
            this.size += 0.1; // Smoke expands
        }
        
        this.life--;
        this.alpha = this.life / this.maxLife;
        return this.life > 0;
    }

    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Rocket Class
class Rocket {
    constructor(upgradeSystem) {
        this.upgradeSystem = upgradeSystem;
        this.particles = [];
        this.exhaustTrail = [];
        this.reset();
    }

    reset() {
        this.x = 100;
        this.y = 500;
        // Start with minimal velocity - realistic launch
        this.vx = 2 + this.upgradeSystem.getBonus('ramp') * 0.3;
        this.vy = -5 - this.upgradeSystem.getBonus('booster') * 0.5;
        this.angle = -Math.PI / 4;
        this.fuel = 100 + this.upgradeSystem.getBonus('fuel');
        this.maxFuel = 100 + this.upgradeSystem.getBonus('fuel');
        this.distance = 0;
        this.maxHeight = 0;
        this.isFlying = true;
        this.gravityAssists = 0;
        this.particles = [];
        this.exhaustTrail = [];
        this.launchTime = 0; // Track time since launch for realistic acceleration
        this.rotation = 0; // For visual rotation effects
    }

    applyThrust(active) {
        if (!active || this.fuel <= 0) return;
        
        // Realistic rocket physics: thrust increases as fuel burns (rocket gets lighter)
        const fuelRatio = this.fuel / this.maxFuel;
        const massRatio = 0.3 + 0.7 * fuelRatio; // Rocket mass decreases as fuel depletes
        const baseThrustPower = 0.6 + this.upgradeSystem.getBonus('thrust') * 0.015;
        const thrustPower = baseThrustPower / massRatio; // More thrust with less mass
        
        const fuelEfficiency = 1 - (this.upgradeSystem.getBonus('efficiency') * 0.01);
        
        this.vx += Math.cos(this.angle) * thrustPower;
        this.vy += Math.sin(this.angle) * thrustPower;
        this.fuel -= 0.5 * fuelEfficiency;
        
        if (this.fuel < 0) this.fuel = 0;
        
        // Create thrust particles
        this.createThrustParticles();
    }
    
    createThrustParticles() {
        // Create particles at the back of the rocket
        const exhaustX = this.x - Math.cos(this.angle) * 20;
        const exhaustY = this.y - Math.sin(this.angle) * 20;
        
        // Multiple particles per frame for dense effect
        for (let i = 0; i < 3; i++) {
            const spread = 0.3;
            const vx = -Math.cos(this.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5) * spread;
            const vy = -Math.sin(this.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5) * spread;
            
            // Color varies: orange to yellow to white
            const colors = ['rgba(255, 150, 0, 1)', 'rgba(255, 200, 50, 1)', 'rgba(255, 255, 200, 1)'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const particle = new Particle(
                exhaustX + (Math.random() - 0.5) * 5,
                exhaustY + (Math.random() - 0.5) * 5,
                vx + this.vx * 0.5,
                vy + this.vy * 0.5,
                20 + Math.random() * 15,
                3 + Math.random() * 4,
                color,
                'thrust'
            );
            this.particles.push(particle);
        }
        
        // Add occasional trail particles for exhaust trail
        if (Math.random() < 0.3) {
            const trailParticle = new Particle(
                this.x,
                this.y,
                this.vx * 0.2 + (Math.random() - 0.5) * 0.5,
                this.vy * 0.2 + (Math.random() - 0.5) * 0.5,
                40 + Math.random() * 20,
                2 + Math.random() * 2,
                'rgba(200, 200, 200, 0.6)',
                'trail'
            );
            this.particles.push(trailParticle);
        }
        
        // Limit particle count for performance
        if (this.particles.length > 300) {
            this.particles.splice(0, 50);
        }
    }
    
    createLandingSmoke() {
        // Create smoke particles when landing
        for (let i = 0; i < 10; i++) {
            const smokeParticle = new Particle(
                this.x + (Math.random() - 0.5) * 20,
                this.y,
                (Math.random() - 0.5) * 2,
                -Math.random() * 0.5,
                30 + Math.random() * 20,
                5 + Math.random() * 5,
                'rgba(100, 100, 100, 0.5)',
                'smoke'
            );
            this.particles.push(smokeParticle);
        }
    }

    update(planets) {
        if (!this.isFlying) return;
        
        this.launchTime++;

        // Realistic gravity that decreases with altitude
        const altitude = 600 - this.y;
        const gravityStrength = 0.2 * Math.max(0.1, 1 - altitude / 2000); // Gravity decreases with height
        this.vy += gravityStrength;

        // Enhanced drag calculations
        const dragCoef = 0.001 * (1 - this.upgradeSystem.getBonus('nosecone') * 0.01);
        const liftCoef = 0.002 * (1 + this.upgradeSystem.getBonus('wings') * 0.01);
        
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const dragX = -this.vx * dragCoef * speed;
        const dragY = -this.vy * dragCoef * speed;
        
        this.vx += dragX;
        this.vy += dragY;
        
        // Enhanced lift (when moving horizontally)
        if (this.vx > 0 && this.vy > -2) {
            this.vy -= liftCoef * this.vx;
        }

        // Check for gravity assist from planets
        const detectionRange = 100 + this.upgradeSystem.getBonus('detector');
        const boostPower = 1 + this.upgradeSystem.getBonus('boost') * 0.01;
        
        planets.forEach(planet => {
            const dx = planet.x - this.x;
            const dy = planet.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < detectionRange && distance > planet.radius) {
                // Gravity assist - boost speed when passing near planet
                const assistStrength = (detectionRange - distance) / detectionRange;
                const angle = Math.atan2(dy, dx);
                const assistBoost = assistStrength * 0.3 * boostPower;
                
                // Accelerate perpendicular to the direction to planet (slingshot effect)
                this.vx += Math.cos(angle + Math.PI / 2) * assistBoost;
                this.vy += Math.sin(angle + Math.PI / 2) * assistBoost;
                
                if (assistStrength > 0.5) {
                    this.gravityAssists++;
                }
            }
        });

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Update angle based on velocity with smooth interpolation
        if (speed > 1) {
            const targetAngle = Math.atan2(this.vy, this.vx);
            // Smooth angle transition
            let angleDiff = targetAngle - this.angle;
            // Normalize angle difference
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            this.angle += angleDiff * 0.1;
        }

        // Track stats
        this.distance = Math.max(this.distance, this.x);
        this.maxHeight = Math.max(this.maxHeight, 600 - this.y);

        // Check if landed
        if (this.y >= 580) {
            this.y = 580;
            if (this.isFlying) {
                this.createLandingSmoke();
            }
            this.isFlying = false;
        }

        // Check if off screen left
        if (this.x < 0) {
            this.isFlying = false;
        }
        
        // Update particles
        this.particles = this.particles.filter(p => p.update());
    }

    draw(ctx, cameraX, cameraY, thrustActive) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // Draw particles first (behind rocket)
        this.particles.forEach(p => p.draw(ctx, cameraX, cameraY));
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.angle);

        // Get upgrade levels for visual modifications
        const thrustLevel = this.upgradeSystem.gameState.upgrades.thrust;
        const wingLevel = this.upgradeSystem.gameState.upgrades.wings;
        const noseconeLevel = this.upgradeSystem.gameState.upgrades.nosecone;
        const boosterLevel = this.upgradeSystem.gameState.upgrades.booster;
        
        // Enhanced flame if thrusting
        if (thrustActive && this.fuel > 0) {
            const flameLength = 20 + thrustLevel * 3;
            const flameWidth = 8 + thrustLevel * 1.5;
            
            // Animated flame
            const flicker = Math.sin(Date.now() * 0.02) * 2 + Math.random() * 3;
            
            // Outer flame (orange)
            ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-flameLength - flicker, -flameWidth);
            ctx.lineTo(-flameLength - flicker - 5, 0);
            ctx.lineTo(-flameLength - flicker, flameWidth);
            ctx.closePath();
            ctx.fill();
            
            // Inner flame (yellow)
            ctx.fillStyle = 'rgba(255, 200, 50, 0.9)';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-flameLength * 0.6 - flicker * 0.5, -flameWidth * 0.6);
            ctx.lineTo(-flameLength * 0.7 - flicker * 0.5, 0);
            ctx.lineTo(-flameLength * 0.6 - flicker * 0.5, flameWidth * 0.6);
            ctx.closePath();
            ctx.fill();
            
            // Core flame (white hot)
            ctx.fillStyle = 'rgba(255, 255, 200, 1)';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-flameLength * 0.3, -flameWidth * 0.3);
            ctx.lineTo(-flameLength * 0.4, 0);
            ctx.lineTo(-flameLength * 0.3, flameWidth * 0.3);
            ctx.closePath();
            ctx.fill();
            
            // Engine glow
            const glowSize = 15 + thrustLevel * 2;
            const gradient = ctx.createRadialGradient(-15, 0, 0, -15, 0, glowSize);
            gradient.addColorStop(0, 'rgba(255, 150, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(-15 - glowSize, -glowSize, glowSize * 2, glowSize * 2);
        }

        // Booster attachments (if upgraded)
        if (boosterLevel > 0) {
            ctx.fillStyle = '#888';
            const boosterSize = 2 + boosterLevel * 0.5;
            // Top booster
            ctx.fillRect(-12, -8 - boosterSize, 8, boosterSize * 2);
            // Bottom booster
            ctx.fillRect(-12, 8 - boosterSize, 8, boosterSize * 2);
        }

        // Enhanced engine based on thrust upgrades
        const engineSize = 15 + thrustLevel * 2;
        ctx.fillStyle = '#555';
        ctx.fillRect(-engineSize, -6, engineSize, 12);
        
        // Engine nozzle details
        ctx.fillStyle = '#333';
        ctx.fillRect(-engineSize, -4, engineSize - 2, 8);

        // Draw rocket body - gets slightly larger with upgrades
        const bodyLength = 30 + Math.min(thrustLevel + wingLevel, 10);
        const bodyHeight = 10;
        
        // Body gradient for depth
        const bodyGradient = ctx.createLinearGradient(0, -bodyHeight/2, 0, bodyHeight/2);
        bodyGradient.addColorStop(0, '#f0f0f0');
        bodyGradient.addColorStop(0.5, '#e0e0e0');
        bodyGradient.addColorStop(1, '#c0c0c0');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(-15, -bodyHeight/2, bodyLength, bodyHeight);
        
        // Body details/stripes
        ctx.fillStyle = '#64b5f6';
        ctx.fillRect(0, -bodyHeight/2, 3, bodyHeight);
        
        // Draw nose cone - changes shape with upgrades
        const noseLength = 15 + noseconeLevel * 2;
        const noseWidth = noseconeLevel > 3 ? 4 : 5; // More streamlined
        
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(bodyLength - 15, 0);
        ctx.lineTo(bodyLength - 15 + noseLength, -noseWidth);
        ctx.lineTo(bodyLength - 15 + noseLength + 3, 0);
        ctx.lineTo(bodyLength - 15 + noseLength, noseWidth);
        ctx.closePath();
        ctx.fill();
        
        // Nose cone highlight
        ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
        ctx.beginPath();
        ctx.moveTo(bodyLength - 15, 0);
        ctx.lineTo(bodyLength - 15 + noseLength * 0.7, -noseWidth * 0.7);
        ctx.lineTo(bodyLength - 15 + noseLength * 0.8, 0);
        ctx.closePath();
        ctx.fill();
        
        // Draw fins/wings - larger with wing upgrades
        const finSize = 7 + wingLevel * 1.5;
        const finLength = 10 + wingLevel * 2;
        
        // Wing gradient
        const wingGradient = ctx.createLinearGradient(0, 0, -finLength, finSize);
        wingGradient.addColorStop(0, '#6666ff');
        wingGradient.addColorStop(1, '#4444cc');
        
        ctx.fillStyle = wingGradient;
        
        // Top fin
        ctx.beginPath();
        ctx.moveTo(-10, -bodyHeight/2);
        ctx.lineTo(-10, -bodyHeight/2 - finSize);
        ctx.lineTo(-10 - finLength, -bodyHeight/2 - finSize * 0.3);
        ctx.lineTo(-5, -bodyHeight/2);
        ctx.closePath();
        ctx.fill();
        
        // Bottom fin
        ctx.beginPath();
        ctx.moveTo(-10, bodyHeight/2);
        ctx.lineTo(-10, bodyHeight/2 + finSize);
        ctx.lineTo(-10 - finLength, bodyHeight/2 + finSize * 0.3);
        ctx.lineTo(-5, bodyHeight/2);
        ctx.closePath();
        ctx.fill();
        
        // Fin outlines for definition
        ctx.strokeStyle = '#3333aa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, -bodyHeight/2);
        ctx.lineTo(-10, -bodyHeight/2 - finSize);
        ctx.lineTo(-10 - finLength, -bodyHeight/2 - finSize * 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-10, bodyHeight/2);
        ctx.lineTo(-10, bodyHeight/2 + finSize);
        ctx.lineTo(-10 - finLength, bodyHeight/2 + finSize * 0.3);
        ctx.stroke();
        
        // Window/cockpit
        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(5, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }
}

// Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.upgradeSystem = new UpgradeSystem(this.gameState);
        this.rocket = new Rocket(this.upgradeSystem);
        this.planets = [];
        this.cameraX = 0;
        this.cameraY = 0;
        this.isPlaying = false;
        this.thrustActive = false;
        this.achievementsShown = new Set();
        
        this.setupEventListeners();
        this.generatePlanets();
        this.updateUI();
        this.render();
    }

    generatePlanets() {
        this.planets = [];
        // Generate random planets along the flight path
        for (let i = 0; i < 15; i++) {
            const x = 500 + Math.random() * 8000;
            const y = 200 + Math.random() * 400;
            const radius = 20 + Math.random() * 30;
            const mass = radius;
            this.planets.push(new Planet(x, y, radius, mass));
        }
    }

    setupEventListeners() {
        document.getElementById('launch-btn').addEventListener('click', () => this.launch());
        document.getElementById('shop-btn').addEventListener('click', () => this.toggleShop());
        document.getElementById('close-shop').addEventListener('click', () => this.toggleShop());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());

        // Thrust controls
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isPlaying) {
                e.preventDefault();
                this.thrustActive = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.thrustActive = false;
            }
        });

        this.canvas.addEventListener('mousedown', () => {
            if (this.isPlaying) this.thrustActive = true;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.thrustActive = false;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isPlaying) this.thrustActive = true;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.thrustActive = false;
        });

        // Setup upgrade buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const upgrade = btn.dataset.upgrade;
                if (this.upgradeSystem.purchase(upgrade)) {
                    this.updateUI();
                }
            });
        });
    }

    launch() {
        if (this.isPlaying) return;
        
        this.rocket.reset();
        this.generatePlanets();
        this.isPlaying = true;
        this.thrustActive = false;
        this.cameraX = 0;
        this.cameraY = 0;
        this.achievementsShown.clear(); // Reset achievements for this flight
        
        document.getElementById('flight-stats').classList.remove('hidden');
        document.getElementById('launch-btn').disabled = true;
        document.getElementById('game-messages').textContent = '';
        
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isPlaying) return;
        
        this.rocket.applyThrust(this.thrustActive);
        this.rocket.update(this.planets);
        this.planets.forEach(p => p.update());
        
        // Camera follows rocket
        this.cameraX = this.rocket.x - 200;
        this.cameraY = this.rocket.y - 300;
        
        this.updateFlightStats();
        
        if (!this.rocket.isFlying) {
            this.endFlight();
            return;
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    endFlight() {
        this.isPlaying = false;
        document.getElementById('launch-btn').disabled = false;
        document.getElementById('flight-stats').classList.add('hidden');
        
        const distance = Math.floor(this.rocket.distance);
        const height = Math.floor(this.rocket.maxHeight);
        const assists = this.rocket.gravityAssists;
        
        // Calculate earnings
        const baseEarnings = Math.floor(distance / 10 + height / 5);
        const luckBonus = 1 + this.upgradeSystem.getBonus('luck') * 0.01;
        const assistBonus = assists * 50;
        const totalEarnings = Math.floor((baseEarnings + assistBonus) * luckBonus);
        
        this.gameState.money += totalEarnings;
        
        if (distance > this.gameState.bestDistance) {
            this.gameState.bestDistance = distance;
        }
        if (height > this.gameState.bestHeight) {
            this.gameState.bestHeight = height;
        }
        
        this.gameState.saveGame();
        this.updateUI();
        
        let message = `Flight Complete! Earned $${totalEarnings}`;
        if (assists > 0) {
            message += ` (${assists} gravity assists!)`;
        }
        document.getElementById('game-messages').textContent = message;
    }

    toggleShop() {
        const shop = document.getElementById('shop');
        shop.classList.toggle('hidden');
        this.updateUI();
    }

    updateUI() {
        document.getElementById('money').textContent = '$' + this.gameState.money;
        document.getElementById('best-distance').textContent = Math.floor(this.gameState.bestDistance) + 'm';
        document.getElementById('best-height').textContent = Math.floor(this.gameState.bestHeight) + 'm';
        
        // Update upgrade UI
        for (const upgrade in this.gameState.upgrades) {
            const level = this.gameState.upgrades[upgrade];
            const cost = this.upgradeSystem.getCost(upgrade);
            const canAfford = this.upgradeSystem.canAfford(upgrade);
            
            document.getElementById(`${upgrade}-level`).textContent = level;
            document.getElementById(`${upgrade}-cost`).textContent = cost;
            
            const btn = document.querySelector(`[data-upgrade="${upgrade}"]`);
            btn.disabled = !canAfford;
        }
    }

    updateFlightStats() {
        const distance = Math.floor(this.rocket.distance);
        const height = Math.floor(this.rocket.maxHeight);
        const speed = Math.floor(Math.sqrt(this.rocket.vx * this.rocket.vx + this.rocket.vy * this.rocket.vy));
        
        document.getElementById('current-distance').textContent = distance;
        document.getElementById('current-height').textContent = height;
        document.getElementById('current-speed').textContent = speed;
        
        // Update speed bar (max speed for display: 50 m/s)
        const speedPercent = Math.min((speed / 50) * 100, 100);
        document.getElementById('speed-bar').style.width = speedPercent + '%';
        
        const fuelPercent = Math.floor((this.rocket.fuel / this.rocket.maxFuel) * 100);
        document.getElementById('current-fuel').textContent = fuelPercent + '%';
        
        // Update fuel bar
        const fuelBar = document.getElementById('fuel-bar');
        fuelBar.style.width = fuelPercent + '%';
        
        // Add warning class when fuel is low
        if (fuelPercent < 20) {
            fuelBar.classList.add('low');
        } else {
            fuelBar.classList.remove('low');
        }
        
        // Check for achievements
        this.checkAchievements(distance, height, speed);
    }
    
    checkAchievements(distance, height, speed) {
        const achievements = [
            { id: 'speed_25', condition: speed >= 25, message: '🚀 Speed Demon! 25 m/s!' },
            { id: 'speed_40', condition: speed >= 40, message: '⚡ Supersonic! 40 m/s!' },
            { id: 'height_200', condition: height >= 200, message: '⬆️ High Flyer! 200m altitude!' },
            { id: 'height_500', condition: height >= 500, message: '🌟 Sky High! 500m altitude!' },
            { id: 'distance_500', condition: distance >= 500, message: '📏 Long Journey! 500m traveled!' },
            { id: 'distance_1000', condition: distance >= 1000, message: '🏆 Epic Voyage! 1000m traveled!' }
        ];
        
        achievements.forEach(achievement => {
            if (achievement.condition && !this.achievementsShown.has(achievement.id)) {
                this.showAchievement(achievement.message);
                this.achievementsShown.add(achievement.id);
            }
        });
    }
    
    showAchievement(message) {
        const notification = document.getElementById('achievement-notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        
        // Hide after animation completes
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }

    resetGame() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.gameState.resetGame();
            this.rocket = new Rocket(this.upgradeSystem);
            this.updateUI();
            this.isPlaying = false;
            document.getElementById('flight-stats').classList.add('hidden');
            document.getElementById('game-messages').textContent = 'Game Reset!';
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate altitude factor for background changes
        const altitude = this.isPlaying ? (600 - this.rocket.y) : 0;
        const spaceBlend = Math.min(altitude / 1000, 1); // Transition to space at 1000m
        
        // Draw enhanced background gradient that changes with altitude
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        // Interpolate colors based on altitude
        const color1 = this.interpolateColor('#000814', '#000000', spaceBlend);
        const color2 = this.interpolateColor('#1a1a3e', '#0a0a1a', spaceBlend);
        const color3 = this.interpolateColor('#264653', '#1a2030', spaceBlend);
        const color4 = this.interpolateColor('#2a4a5a', '#202040', spaceBlend);
        
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.3, color2);
        gradient.addColorStop(0.7, color3);
        gradient.addColorStop(1, color4);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw multiple layers of stars with parallax (more stars in space)
        const starDensityMultiplier = 1 + spaceBlend * 2;
        
        // Distant stars (slow parallax)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 100 * starDensityMultiplier; i++) {
            const x = (i * 237 + this.cameraX * 0.05) % this.canvas.width;
            const y = (i * 139 + this.cameraY * 0.05) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
        
        // Medium stars
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 60 * starDensityMultiplier; i++) {
            const x = (i * 331 + this.cameraX * 0.15) % this.canvas.width;
            const y = (i * 197 + this.cameraY * 0.15) % this.canvas.height;
            const twinkle = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;
            this.ctx.globalAlpha = 0.6 * twinkle;
            this.ctx.fillRect(x, y, 2, 2);
        }
        this.ctx.globalAlpha = 1;
        
        // Close stars (fast parallax)
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 40 * starDensityMultiplier; i++) {
            const x = (i * 419 + this.cameraX * 0.3) % this.canvas.width;
            const y = (i * 283 + this.cameraY * 0.3) % this.canvas.height;
            const size = 1 + (i % 3);
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Draw ground with texture (fades at high altitude)
        const groundY = 580 - this.cameraY;
        
        if (groundY < this.canvas.height + 100) {
            const groundAlpha = Math.max(0, 1 - spaceBlend * 0.5);
            this.ctx.globalAlpha = groundAlpha;
            
            // Ground gradient
            const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
            groundGradient.addColorStop(0, '#3d6b2e');
            groundGradient.addColorStop(0.3, '#2d5016');
            groundGradient.addColorStop(1, '#1a3010');
            this.ctx.fillStyle = groundGradient;
            this.ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);
            
            // Ground texture/details
            this.ctx.fillStyle = 'rgba(50, 80, 30, 0.5)';
            for (let i = 0; i < 50; i++) {
                const x = (i * 157 - this.cameraX * 0.5) % this.canvas.width;
                if (x < 0) continue;
                this.ctx.fillRect(x, groundY + 5 + (i % 10), 3 + (i % 3), 2);
            }
            
            this.ctx.globalAlpha = 1;
        }
        
        // Draw enhanced launch pad (only if visible)
        const padX = 100 - this.cameraX;
        if (padX > -100 && padX < this.canvas.width + 100 && groundY < this.canvas.height + 100) {
            const padAlpha = Math.max(0, 1 - spaceBlend * 0.5);
            this.ctx.globalAlpha = padAlpha;
            
            // Platform shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(padX - 45, groundY - 18, 90, 20);
            
            // Platform
            const platformGradient = this.ctx.createLinearGradient(padX - 40, groundY - 20, padX - 40, groundY);
            platformGradient.addColorStop(0, '#888');
            platformGradient.addColorStop(1, '#555');
            this.ctx.fillStyle = platformGradient;
            this.ctx.fillRect(padX - 40, groundY - 20, 80, 20);
            
            // Platform details/grid
            this.ctx.strokeStyle = '#444';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const x = padX - 40 + i * 10;
                this.ctx.beginPath();
                this.ctx.moveTo(x, groundY - 20);
                this.ctx.lineTo(x, groundY);
                this.ctx.stroke();
            }
            
            // Support structure
            this.ctx.fillStyle = '#777';
            this.ctx.fillRect(padX - 8, groundY - 70, 16, 50);
            
            // Support details
            this.ctx.fillStyle = '#999';
            this.ctx.fillRect(padX - 6, groundY - 70, 12, 50);
            
            // Cross beams
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(padX - 8, groundY - 50);
            this.ctx.lineTo(padX + 8, groundY - 40);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(padX + 8, groundY - 50);
            this.ctx.lineTo(padX - 8, groundY - 40);
            this.ctx.stroke();
            
            // Lights on launch pad
            const lightColor = this.isPlaying ? 'rgba(255, 50, 50, 0.8)' : 'rgba(50, 255, 50, 0.8)';
            this.ctx.fillStyle = lightColor;
            this.ctx.beginPath();
            this.ctx.arc(padX - 30, groundY - 15, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(padX + 30, groundY - 15, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1;
        }
        
        // Draw planets
        this.planets.forEach(planet => {
            planet.draw(this.ctx, this.cameraX, this.cameraY);
        });
        
        // Draw rocket
        this.rocket.draw(this.ctx, this.cameraX, this.cameraY, this.thrustActive);
        
        requestAnimationFrame(() => this.render());
    }
    
    interpolateColor(color1, color2, factor) {
        // Simple hex color interpolation
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);
        
        const r1 = (c1 >> 16) & 0xff;
        const g1 = (c1 >> 8) & 0xff;
        const b1 = c1 & 0xff;
        
        const r2 = (c2 >> 16) & 0xff;
        const g2 = (c2 >> 8) & 0xff;
        const b2 = c2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
