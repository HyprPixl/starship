# 🚀 Starship - Escape to Space

A modern web-based game inspired by "Learn to Fly", built with vanilla JavaScript, HTML5 Canvas, and CSS3.

## 🎮 Game Overview

Launch your rocket and try to escape Earth's gravity! Use the money you earn from each flight to purchase upgrades and improve your rocket's performance. Navigate near planets to get gravity assist speed boosts!

## ✨ Features

- **Physics-based Flight System**: Realistic gravity, drag, and lift mechanics
- **Comprehensive Upgrade System**: 10 different upgrade categories across 4 main systems
- **Unique Gravity Assist Mechanic**: Fly near planets to get slingshot speed boosts
- **Progressive Difficulty**: Upgrade costs increase with each purchase
- **Persistent Progress**: Your game progress is automatically saved using localStorage
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful UI**: Modern glassmorphism design with smooth animations

## 🎯 How to Play

1. **Launch**: Click the LAUNCH button to start your flight
2. **Fly**: Hold SPACE or CLICK on the canvas to fire thrusters (uses fuel)
3. **Gravity Assist**: Fly near the glowing planets to get speed boosts
4. **Earn Money**: Travel farther to earn more money
5. **Upgrade**: Use money to improve your rocket's capabilities
6. **Goal**: Reach space and escape Earth's gravity!

## 🛠️ Upgrade Categories

### 🔥 Engine Power
- **Fuel Capacity**: Increase total fuel reserves
- **Thrust Power**: Increase engine acceleration
- **Fuel Efficiency**: Reduce fuel consumption rate

### ✈️ Aerodynamics
- **Wing Design**: Improve glide efficiency for longer flights
- **Nose Cone**: Reduce air resistance

### 🌟 Special Systems
- **Gravity Detector**: Increase detection range for gravity assists
- **Boost Reserves**: Enhance gravity assist boost power
- **Lucky Charm**: Earn more money from each flight

### 🎯 Launch Systems
- **Launch Ramp**: Increase initial launch speed
- **Booster Rockets**: Add initial speed burst at launch

## 🚀 Getting Started

Simply open `index.html` in a modern web browser to start playing!

For local development with a web server:
```bash
python3 -m http.server 8080
```

Then navigate to `http://localhost:8080/index.html`

## 🎨 Technology Stack

- **HTML5 Canvas**: For rendering game graphics
- **Vanilla JavaScript (ES6+)**: Game logic and mechanics
- **CSS3**: Modern styling with gradients, animations, and glassmorphism
- **LocalStorage API**: For persistent game saves

## 🌌 Game Mechanics

### Flight Physics
- Gravity pulls the rocket down
- Thrust propels the rocket forward
- Drag slows the rocket based on speed
- Lift helps keep the rocket airborne when moving horizontally

### Gravity Assist
The unique mechanic of this game! When you fly near planets:
- Planets create gravity wells that can boost your speed
- The closer you pass to a planet, the stronger the assist
- Each successful assist earns bonus money
- Upgrade the Gravity Detector to increase detection range
- Upgrade Boost Reserves to increase assist power

### Economy System
- Earn money based on distance traveled and maximum height reached
- Bonus money for each gravity assist performed
- Lucky Charm upgrade increases all earnings
- Upgrade costs increase exponentially with each level

## 📝 License

Open source - feel free to use and modify!
