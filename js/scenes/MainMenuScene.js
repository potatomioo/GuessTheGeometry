class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Add background
        this.add.image(0, 0, 'background').setOrigin(0);
        
        // Add game title with shadow
        const titleShadow = this.add.text(
            CONFIG.width / 2 + 4, 
            120 + 4, 
            'Shape Sorter', 
            { 
                fontFamily: 'Arial',
                fontSize: '64px',
                fontStyle: 'bold',
                color: '#000000',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0.5);
        
        const title = this.add.text(
            CONFIG.width / 2, 
            120, 
            'Shape Sorter', 
            { 
                fontFamily: 'Arial',
                fontSize: '64px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Add description
        this.add.text(
            CONFIG.width / 2, 
            200, 
            'Sort the shapes by dragging them to the matching baskets!', 
            { 
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5);

        // Create start button
        const startButton = this.createButton(
            CONFIG.width / 2,
            300,
            'button',
            'Start Game',
            () => {
                this.playButtonSound();
                this.startGame();
            }
        );
        
        // Add instructions
        const instructions = [
            "HOW TO PLAY:",
            "1. Drag shapes to their matching baskets",
            "2. Score points for correct matches",
            "3. Complete all 3 levels to win",
            "4. Each level gets faster!"
        ];
        
        let yPos = 380;
        instructions.forEach((line, index) => {
            const style = {
                fontFamily: 'Arial',
                fontSize: index === 0 ? '22px' : '18px',
                fontStyle: index === 0 ? 'bold' : 'normal',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            };
            
            this.add.text(CONFIG.width / 2, yPos, line, style).setOrigin(0.5);
            yPos += 30;
        });
        
        // Add decorative shapes
        this.addDecorativeShapes();
        
        // Start background music if available
        this.startBackgroundMusic();
    }
    
    startBackgroundMusic() {
        // Only try to play music if it exists in the cache
        if (this.cache.audio.exists('music')) {
            if (!this.sound.get('music')) {
                this.sound.add('music', { loop: true, volume: 0.5 });
            }
            if (!this.sound.get('music').isPlaying) {
                this.sound.play('music');
            }
        }
    }
    
    createButton(x, y, key, text, callback) {
        // Create button group
        const button = this.add.image(x, y, key);
        const buttonText = this.add.text(
            x, 
            y, 
            text, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Make button interactive
        button.setInteractive();
        
        // Button events
        button.on('pointerover', () => {
            button.setTint(0xdddddd);
        });
        
        button.on('pointerout', () => {
            button.clearTint();
        });
        
        button.on('pointerdown', callback);
        
        return { button, buttonText };
    }
    
    addDecorativeShapes() {
        // Add some shapes around the menu for decoration
        const shapes = ['shape_circle', 'shape_triangle', 'shape_square', 'shape_rectangle'];
        const colors = SHAPE_COLORS;
        
        // Create random shapes around the screen edges
        for (let i = 0; i < 12; i++) {
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Position along the edges
            let x, y;
            if (i < 3) {
                // Top edge
                x = 100 + Math.random() * (CONFIG.width - 200);
                y = 50 + Math.random() * 50;
            } else if (i < 6) {
                // Right edge
                x = CONFIG.width - 50 - Math.random() * 50;
                y = 100 + Math.random() * (CONFIG.height - 200);
            } else if (i < 9) {
                // Bottom edge
                x = 100 + Math.random() * (CONFIG.width - 200);
                y = CONFIG.height - 50 - Math.random() * 50;
            } else {
                // Left edge
                x = 50 + Math.random() * 50;
                y = 100 + Math.random() * (CONFIG.height - 200);
            }
            
            // Add shape with animation
            const decorShape = this.add.image(x, y, shape).setTint(color);
            decorShape.setScale(0.8 + Math.random() * 0.4);
            decorShape.angle = Math.random() * 360;
            
            // Add floating animation
            this.tweens.add({
                targets: decorShape,
                y: y + 10 + Math.random() * 10,
                angle: decorShape.angle + (Math.random() > 0.5 ? 10 : -10),
                duration: 1000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    playButtonSound() {
        if (this.cache.audio.exists('click')) {
            this.sound.play('click');
        }
    }
    
    startGame() {
        // Start with level 1
        GAME_STATE.currentLevel = 1;
        GAME_STATE.score = 0;
        GAME_STATE.shapesProcessed = 0;
        this.scene.start('GameScene');
    }
}