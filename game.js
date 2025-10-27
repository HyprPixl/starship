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
        
        // Draw glow effect
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.radius * 2);
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 0.8;
        gradient.addColorStop(0, `rgba(100, 200, 255, ${0.3 * pulse})`);
        gradient.addColorStop(0.5, `rgba(100, 150, 255, ${0.1 * pulse})`);
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(screenX - this.radius * 2, screenY - this.radius * 2, 
                     this.radius * 4, this.radius * 4);
        
        // Draw planet
        ctx.fillStyle = '#4488ff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX - this.radius * 0.3, screenY - this.radius * 0.3, 
                this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Rocket Class
class Rocket {
    constructor(upgradeSystem) {
        this.upgradeSystem = upgradeSystem;
        this.reset();
    }

    reset() {
        this.x = 100;
        this.y = 500;
        this.vx = 10 + this.upgradeSystem.getBonus('ramp');
        this.vy = -20 - this.upgradeSystem.getBonus('booster');
        this.angle = -Math.PI / 4;
        this.fuel = 100 + this.upgradeSystem.getBonus('fuel');
        this.maxFuel = 100 + this.upgradeSystem.getBonus('fuel');
        this.distance = 0;
        this.maxHeight = 0;
        this.isFlying = true;
        this.gravityAssists = 0;
    }

    applyThrust(active) {
        if (!active || this.fuel <= 0) return;
        
        const thrustPower = 0.5 + this.upgradeSystem.getBonus('thrust') * 0.01;
        const fuelEfficiency = 1 - (this.upgradeSystem.getBonus('efficiency') * 0.01);
        
        this.vx += Math.cos(this.angle) * thrustPower;
        this.vy += Math.sin(this.angle) * thrustPower;
        this.fuel -= 0.5 * fuelEfficiency;
        
        if (this.fuel < 0) this.fuel = 0;
    }

    update(planets) {
        if (!this.isFlying) return;

        // Gravity
        const gravity = 0.2;
        this.vy += gravity;

        // Drag
        const dragCoef = 0.001 * (1 - this.upgradeSystem.getBonus('nosecone') * 0.01);
        const liftCoef = 0.002 * (1 + this.upgradeSystem.getBonus('wings') * 0.01);
        
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const dragX = -this.vx * dragCoef * speed;
        const dragY = -this.vy * dragCoef * speed;
        
        this.vx += dragX;
        this.vy += dragY;
        
        // Lift (when moving horizontally)
        if (this.vx > 0) {
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

        // Update angle based on velocity
        if (speed > 1) {
            this.angle = Math.atan2(this.vy, this.vx);
        }

        // Track stats
        this.distance = Math.max(this.distance, this.x);
        this.maxHeight = Math.max(this.maxHeight, 600 - this.y);

        // Check if landed
        if (this.y >= 580) {
            this.y = 580;
            this.isFlying = false;
        }

        // Check if off screen left
        if (this.x < 0) {
            this.isFlying = false;
        }
    }

    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(this.angle);

        // Draw flame if thrusting
        if (this.fuel > 0) {
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-25, -5);
            ctx.lineTo(-25, 5);
            ctx.closePath();
            ctx.fill();
        }

        // Draw rocket body
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(-15, -5, 30, 10);
        
        // Draw nose cone
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(25, -5);
        ctx.lineTo(25, 5);
        ctx.closePath();
        ctx.fill();
        
        // Draw fins
        ctx.fillStyle = '#4444ff';
        ctx.beginPath();
        ctx.moveTo(-10, 5);
        ctx.lineTo(-10, 12);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-10, -12);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fill();

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
        document.getElementById('current-distance').textContent = Math.floor(this.rocket.distance);
        document.getElementById('current-height').textContent = Math.floor(this.rocket.maxHeight);
        document.getElementById('current-speed').textContent = Math.floor(Math.sqrt(this.rocket.vx * this.rocket.vx + this.rocket.vy * this.rocket.vy));
        document.getElementById('current-fuel').textContent = Math.floor(this.rocket.fuel);
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
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000814');
        gradient.addColorStop(0.5, '#1a1a3e');
        gradient.addColorStop(1, '#264653');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = (i * 237 + this.cameraX * 0.1) % this.canvas.width;
            const y = (i * 139 + this.cameraY * 0.1) % this.canvas.height;
            this.ctx.fillRect(x, y, 2, 2);
        }
        
        // Draw ground
        const groundY = 580 - this.cameraY;
        this.ctx.fillStyle = '#2d5016';
        this.ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);
        
        // Draw launch pad
        const padX = 100 - this.cameraX;
        if (padX > -50 && padX < this.canvas.width + 50) {
            this.ctx.fillStyle = '#666';
            this.ctx.fillRect(padX - 40, groundY - 20, 80, 20);
            this.ctx.fillStyle = '#888';
            this.ctx.fillRect(padX - 5, groundY - 60, 10, 60);
        }
        
        // Draw planets
        this.planets.forEach(planet => {
            planet.draw(this.ctx, this.cameraX, this.cameraY);
        });
        
        // Draw rocket
        this.rocket.draw(this.ctx, this.cameraX, this.cameraY);
        
        requestAnimationFrame(() => this.render());
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
