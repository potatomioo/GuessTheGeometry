class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Load game assets
        this.loadImageWithErrorHandling('background', 'assets/images/background.png');
        this.loadImageWithErrorHandling('conveyor', 'assets/images/conveyor.png');
        this.loadImageWithErrorHandling('dish', 'assets/images/dish.png');
        this.loadImageWithErrorHandling('button', 'assets/images/button.png');
        this.loadImageWithErrorHandling('basket', 'assets/images/basket.png');
        this.loadImageWithErrorHandling('star', 'assets/images/star.png');
        
        // Load sounds with error handling
        this.loadAudioWithErrorHandling('click', 'assets/sounds/click.mp3');
        this.loadAudioWithErrorHandling('correct', 'assets/sounds/correct.mp3');
        this.loadAudioWithErrorHandling('wrong', 'assets/sounds/wrong.mp3');
        this.loadAudioWithErrorHandling('levelComplete', 'assets/sounds/level-complete.mp3');
        this.loadAudioWithErrorHandling('gameOver', 'assets/sounds/game-over.mp3');
        this.loadAudioWithErrorHandling('music', 'assets/sounds/music.mp3');
        
        // Create color graphics for shapes
        this.createShapeGraphics();
    }
    
    loadImageWithErrorHandling(key, path) {
        this.load.image(key, path).on('fileerror', () => {
            console.log(`Image ${key} not found, will use fallback.`);
        });
    }
    
    loadAudioWithErrorHandling(key, path) {
        this.load.audio(key, path).on('fileerror', () => {
            console.log(`Audio ${key} not found, continuing without it.`);
        });
    }
    
    createShapeGraphics() {
        // We'll generate colored shape textures programmatically
        
        // Circle
        const circleGraphics = this.make.graphics();
        circleGraphics.fillStyle(0xffffff);
        circleGraphics.fillCircle(25, 25, 25);
        circleGraphics.generateTexture('shape_circle', 50, 50);
        
        // Triangle
        const triangleGraphics = this.make.graphics();
        triangleGraphics.fillStyle(0xffffff);
        triangleGraphics.fillTriangle(25, 0, 50, 50, 0, 50);
        triangleGraphics.generateTexture('shape_triangle', 50, 50);
        
        // Square
        const squareGraphics = this.make.graphics();
        squareGraphics.fillStyle(0xffffff);
        squareGraphics.fillRect(0, 0, 50, 50);
        squareGraphics.generateTexture('shape_square', 50, 50);
        
        // Rectangle
        const rectangleGraphics = this.make.graphics();
        rectangleGraphics.fillStyle(0xffffff);
        rectangleGraphics.fillRect(0, 10, 60, 30);
        rectangleGraphics.generateTexture('shape_rectangle', 60, 50);
    }

    create() {
        // Create textures from graphics if we're missing actual assets
        this.createFallbackTextures();
        
        // Show "Loading Complete" text
        const text = this.add.text(
            CONFIG.width / 2, 
            CONFIG.height / 2, 
            'Loading Complete', 
            { 
                font: '24px Arial', 
                fill: '#ffffff' 
            }
        ).setOrigin(0.5);
        
        // Transition to main menu after a short delay
        this.time.delayedCall(1000, () => {
            this.scene.start('MainMenuScene');
        });
    }
    
    createFallbackTextures() {
        // Create fallback textures if assets aren't loaded
        
        // Background
        if (!this.textures.exists('background')) {
            const bg = this.make.graphics();
            bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4682B4, 0x4682B4, 1);
            bg.fillRect(0, 0, CONFIG.width, CONFIG.height);
            bg.generateTexture('background', CONFIG.width, CONFIG.height);
        }
        
        // Conveyor belt
        if (!this.textures.exists('conveyor')) {
            const belt = this.make.graphics();
            belt.fillStyle(0x666666);
            belt.fillRect(0, 0, CONFIG.width, 80);
            
            // Add lines to the belt
            belt.lineStyle(2, 0x888888);
            for (let i = 0; i < CONFIG.width; i += 20) {
                belt.lineBetween(i, 0, i + 10, 80);
            }
            
            belt.generateTexture('conveyor', CONFIG.width, 80);
        }
        
        // Dish
        if (!this.textures.exists('dish')) {
            const dish = this.make.graphics();
            dish.fillStyle(0xF5F5F5);
            dish.lineStyle(2, 0xCCCCCC);
            dish.fillEllipse(35, 15, 70, 30);
            dish.strokeEllipse(35, 15, 70, 30);
            dish.generateTexture('dish', 70, 30);
        }
        
        // Button
        if (!this.textures.exists('button')) {
            const button = this.make.graphics();
            button.fillStyle(0x4CAF50);
            button.fillRoundedRect(0, 0, 200, 60, 10);
            button.generateTexture('button', 200, 60);
        }
        
        // Basket
        if (!this.textures.exists('basket')) {
            const basket = this.make.graphics();
            basket.fillStyle(0xffffff);
            basket.lineStyle(4, 0x000000);
            basket.fillRect(0, 0, 120, 120);
            basket.strokeRect(0, 0, 120, 120);
            basket.generateTexture('basket', 120, 120);
        }
        
        // Star
        if (!this.textures.exists('star')) {
            const star = this.make.graphics();
            star.fillStyle(0xFFD700);
            
            // Draw a 5-pointed star
            const centerX = 25;
            const centerY = 25;
            const outerRadius = 25;
            const innerRadius = 10;
            const points = 5;
            
            for (let i = 0; i <= points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (i === 0) {
                    star.moveTo(x, y);
                } else {
                    star.lineTo(x, y);
                }
            }
            
            star.closePath();
            star.fillPath();
            star.generateTexture('star', 50, 50);
        }
    }
}