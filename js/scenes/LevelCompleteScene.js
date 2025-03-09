class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelCompleteScene' });
    }

    create() {
        // Add background
        this.add.image(0, 0, 'background').setOrigin(0);
        
        // Level complete text with shadow
        const titleShadow = this.add.text(
            CONFIG.width / 2 + 4, 
            150 + 4, 
            'Level Complete!', 
            { 
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#000000',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0.5);
        
        const title = this.add.text(
            CONFIG.width / 2, 
            150, 
            'Level Complete!', 
            { 
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Add congratulatory message
        this.add.text(
            CONFIG.width / 2, 
            220, 
            `Great job on Level ${GAME_STATE.currentLevel - 1}!`, 
            { 
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add score information
        this.add.text(
            CONFIG.width / 2, 
            270, 
            `Current Score: ${GAME_STATE.score}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add "Next Level" information
        this.add.text(
            CONFIG.width / 2, 
            330, 
            `Level ${GAME_STATE.currentLevel}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Show difficulty increase
        this.add.text(
            CONFIG.width / 2, 
            380, 
            `Speed: x${GAME_STATE.speeds[GAME_STATE.currentLevel]}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create continue button
        const continueButton = this.add.image(CONFIG.width / 2, 450, 'button');
        const continueText = this.add.text(
            CONFIG.width / 2, 
            450, 
            'Continue', 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Make button interactive
        continueButton.setInteractive();
        
        // Button events
        continueButton.on('pointerover', () => {
            continueButton.setTint(0xdddddd);
        });
        
        continueButton.on('pointerout', () => {
            continueButton.clearTint();
        });
        
        continueButton.on('pointerdown', () => {
            if (this.cache.audio.exists('click')) {
                this.sound.play('click');
            }
            this.startNextLevel();
        });
        
        // Create decorative stars and shapes
        this.createDecorations();
        
        // Allow space to continue as well
        this.input.keyboard.once('keydown-SPACE', () => {
            if (this.cache.audio.exists('click')) {
                this.sound.play('click');
            }
            this.startNextLevel();
        });
    }
    
    createDecorations() {
        // Add stars around the screen
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(50, CONFIG.width - 50);
            const y = Phaser.Math.Between(50, CONFIG.height - 50);
            
            // Avoid center area where text is
            if (x > CONFIG.width/2 - 200 && x < CONFIG.width/2 + 200 &&
                y > 100 && y < 500) {
                continue;
            }
            
            const star = this.add.image(x, y, 'star')
                .setScale(0.3 + Math.random() * 0.4);
            
            // Add pulsing animation
            this.tweens.add({
                targets: star,
                scale: star.scale + 0.2,
                duration: 500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Add some shapes
        const shapeTypes = SHAPE_TYPES;
        for (let i = 0; i < 8; i++) {
            const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            const color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
            
            const x = Phaser.Math.Between(50, CONFIG.width - 50);
            const y = Phaser.Math.Between(50, CONFIG.height - 50);
            
            // Avoid center area where text is
            if (x > CONFIG.width/2 - 200 && x < CONFIG.width/2 + 200 &&
                y > 100 && y < 500) {
                continue;
            }
            
            const shape = this.add.image(x, y, `shape_${type}`)
                .setTint(color)
                .setScale(0.5 + Math.random() * 0.3)
                .setAlpha(0.7);
            
            // Add floating animation
            this.tweens.add({
                targets: shape,
                y: y + 10 + Math.random() * 10,
                duration: 1000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    startNextLevel() {
        // Transition to the next level
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('GameScene');
        });
    }
}