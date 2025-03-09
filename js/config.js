// Game configuration and globals
const CONFIG = {
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB', // Sky blue background
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Global game state
const GAME_STATE = {
    score: 0,
    currentLevel: 1,
    maxLevel: 3,
    shapesPerLevel: 25,
    shapesProcessed: 0,
    dishLineY: 300, // Y position of dish line
    speeds: {
        1: 1,    // Level 1 speed
        2: 1.5,  // Level 2 speed 
        3: 2     // Level 3 speed
    },
    dishSpacing: {
        1: 1600,  // Level 1 spacing
        2: 1500,  // Level 2 spacing
        3: 1500   // Level 3 spacing
    },
    colors: {
        mainText: '#333333',
        scoreText: '#333333',
        buttonBackground: '#4CAF50',
        buttonBackgroundHover: '#3e8e41',
        buttonText: '#FFFFFF',
        highlight: '#FFD700', // Gold
        dishColor: '#F5F5F5',
        dishStroke: '#CCCCCC'
    }
};

// Shape types for the game
const SHAPE_TYPES = ['circle', 'triangle', 'square', 'rectangle'];

// Color palette for shapes
const SHAPE_COLORS = [
    0xff0000, // Red
    0x00ff00, // Green
    0x0000ff, // Blue
    0xffff00, // Yellow
    0xff00ff, // Magenta
    0x00ffff, // Cyan
    0xff8000, // Orange
    0x8000ff, // Purple
    0x0080ff, // Light Blue
    0xff0080  // Pink
];

// Reset game state
function resetGameState() {
    GAME_STATE.score = 0;
    GAME_STATE.currentLevel = 1;
    GAME_STATE.shapesProcessed = 0;
}