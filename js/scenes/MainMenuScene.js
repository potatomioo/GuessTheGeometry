class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Add background
        this.add.image(0, 0, 'background').setOrigin(0);
        
        // Define title area - a safe zone where shapes won't appear
        const titleSafeZone = {
            x: CONFIG.width / 2 - 300,
            y: 80,
            width: 600,
            height: 150
        };
        
        // Add decorative shapes first (behind title)
        this.addDecorativeShapes(titleSafeZone);
        
        // Add game title with shadow
        const titleShadow = this.add.text(
            CONFIG.width / 2 + 4, 
            120 + 4, 
            'Guess The Geometry', 
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
            'Guess The Geometry', 
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
                fontSize: '22px',
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
        this.add.text(
            CONFIG.width / 2,
            380,
            "HOW TO PLAY:",
            { 
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        const instructions = [
            "1. Drag shapes to their matching baskets",
            "2. Score points for correct matches",
            "3. Complete all 3 levels to win",
            "4. Each level gets faster!"
        ];
        
        let yPos = 430;
        instructions.forEach(line => {
            this.add.text(CONFIG.width / 2, yPos, line, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            yPos += 35;
        });
        
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
                fontSize: '28px',
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
    
    addDecorativeShapes(titleSafeZone) {
        // Add some shapes around the menu for decoration
        const shapes = ['shape_circle', 'shape_triangle', 'shape_square', 'shape_rectangle'];
        const colors = SHAPE_COLORS;
        
        // Create random shapes around the screen edges
        for (let i = 0; i < 12; i++) {
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Position the shape, avoiding the title safe zone
            let x, y;
            let isInSafeZone = true;
            
            // Keep generating positions until we find one outside the safe zone
            while (isInSafeZone) {
                if (i < 4) {
                    // Top edge
                    x = Phaser.Math.Between(50, CONFIG.width - 50);
                    y = Phaser.Math.Between(50, CONFIG.height / 4);
                } else if (i < 8) {
                    // Bottom edge
                    x = Phaser.Math.Between(50, CONFIG.width - 50);
                    y = Phaser.Math.Between(CONFIG.height * 3/4, CONFIG.height - 50);
                } else {
                    // Sides
                    if (Math.random() > 0.5) {
                        // Left side
                        x = Phaser.Math.Between(50, CONFIG.width / 4);
                    } else {
                        // Right side
                        x = Phaser.Math.Between(CONFIG.width * 3/4, CONFIG.width - 50);
                    }
                    y = Phaser.Math.Between(50, CONFIG.height - 50);
                }
                
                // Check if this position is inside the title safe zone
                isInSafeZone = (
                    x > titleSafeZone.x && 
                    x < titleSafeZone.x + titleSafeZone.width && 
                    y > titleSafeZone.y && 
                    y < titleSafeZone.y + titleSafeZone.height
                );
                
                // Also avoid the instruction area
                if (y > 350 && y < 580 && x > CONFIG.width / 2 - 250 && x < CONFIG.width / 2 + 250) {
                    isInSafeZone = true;
                }
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