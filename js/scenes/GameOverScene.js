class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.isWin = data.win || false;
    }

    create() {
        // Add background (warehouse image)
        this.add.image(CONFIG.width/2, CONFIG.height/2, 'background')
            .setOrigin(0.5)
            .setDisplaySize(CONFIG.width, CONFIG.height);
        
        // Add semi-transparent overlay
        this.add.rectangle(0, 0, CONFIG.width, CONFIG.height, 0x000000, 0.3).setOrigin(0);
        
        // Game result text
        const titleText = this.isWin ? 'Game Complete!' : 'Game Over';
        const titleColor = this.isWin ? '#FFD700' : '#ff0000';
        
        // Title with shadow
        const titleShadow = this.add.text(
            CONFIG.width / 2 + 4, 
            150 + 4, 
            titleText, 
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
            titleText, 
            { 
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: titleColor,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Add message based on win/lose
        const messageText = this.isWin
            ? 'Congratulations! You completed all levels!'
            : 'Better luck next time!';
            
        this.add.text(
            CONFIG.width / 2, 
            220, 
            messageText, 
            { 
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add final score
        this.add.text(
            CONFIG.width / 2, 
            270, 
            `Final Score: ${GAME_STATE.score}`, 
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
        
        // Create buttons
        // Play Again button
        const playAgainButton = this.add.image(CONFIG.width / 2 - 110, 370, 'button').setScale(0.8);
        const playAgainText = this.add.text(
            CONFIG.width / 2 - 110, 
            370, 
            'Play Again', 
            { 
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Main Menu button
        const menuButton = this.add.image(CONFIG.width / 2 + 110, 370, 'button').setScale(0.8);
        const menuText = this.add.text(
            CONFIG.width / 2 + 110, 
            370, 
            'Main Menu', 
            { 
                fontFamily: 'Arial',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Make buttons interactive
        playAgainButton.setInteractive();
        menuButton.setInteractive();
        
        // Button hover effects
        playAgainButton.on('pointerover', () => {
            playAgainButton.setTint(0xdddddd);
        });
        
        playAgainButton.on('pointerout', () => {
            playAgainButton.clearTint();
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setTint(0xdddddd);
        });
        
        menuButton.on('pointerout', () => {
            menuButton.clearTint();
        });
        
        // Button click handlers
        playAgainButton.on('pointerdown', () => {
            this.sound.play('click');
            this.restartGame();
        });
        
        menuButton.on('pointerdown', () => {
            this.sound.play('click');
            this.returnToMenu();
        });
        
        // Add decorative elements
        this.createDecorations();
        
        // Play game over sound once
        if (this.isWin) {
            // Trophy animation if player won
            this.createTrophyAnimation();
        } else {
            this.sound.play('gameOver');
        }
    }
    
    createDecorations() {
        // Add stars if win, or falling shapes if lose
        if (this.isWin) {
            // Stars for win
            for (let i = 0; i < 30; i++) {
                const x = Phaser.Math.Between(0, CONFIG.width);
                const y = Phaser.Math.Between(0, CONFIG.height);
                
                // Create star with random scale
                const star = this.add.image(x, y, 'star')
                    .setScale(0.2 + Math.random() * 0.4)
                    .setAlpha(0.8);
                
                // Add twinkling animation
                this.tweens.add({
                    targets: star,
                    alpha: 0.4,
                    scale: star.scale - 0.1,
                    duration: 500 + Math.random() * 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        } else {
            // Shapes falling for game over
            const shapeTypes = SHAPE_TYPES;
            
            for (let i = 0; i < 20; i++) {
                const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
                const color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
                
                const x = Phaser.Math.Between(0, CONFIG.width);
                const y = Phaser.Math.Between(-100, -10);
                
                const shape = this.add.image(x, y, `shape_${type}`)
                    .setTint(color)
                    .setAlpha(0.8)
                    .setAngle(Phaser.Math.Between(0, 360));
                
                // Add falling animation
                this.tweens.add({
                    targets: shape,
                    y: CONFIG.height + 100,
                    x: x + Phaser.Math.Between(-100, 100),
                    angle: shape.angle + Phaser.Math.Between(-180, 180),
                    duration: 3000 + Math.random() * 3000,
                    ease: 'Cubic.easeIn'
                });
            }
        }
    }
    
    createTrophyAnimation() {
        // Create a trophy using stars
        const trophyCup = this.add.container(CONFIG.width / 2, CONFIG.height + 200);
        
        // Cup base
        const base = this.add.rectangle(0, 50, 80, 20, 0xFFD700).setOrigin(0.5);
        const stem = this.add.rectangle(0, 30, 20, 40, 0xFFD700).setOrigin(0.5);
        
        // Cup body
        const cupLeft = this.add.rectangle(-30, 0, 20, 60, 0xFFD700).setOrigin(0.5);
        const cupRight = this.add.rectangle(30, 0, 20, 60, 0xFFD700).setOrigin(0.5);
        const cupBottom = this.add.rectangle(0, 30, 60, 20, 0xFFD700).setOrigin(0.5);
        
        // Add handles
        const handleLeft = this.add.ellipse(-40, 0, 15, 30, 0xFFD700).setOrigin(0.5);
        const handleRight = this.add.ellipse(40, 0, 15, 30, 0xFFD700).setOrigin(0.5);
        
        // Add all parts to container
        trophyCup.add([base, stem, cupLeft, cupRight, cupBottom, handleLeft, handleRight]);
        
        // Animate trophy rising
        this.tweens.add({
            targets: trophyCup,
            y: 450,
            duration: 2000,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add star burst after trophy rises
                for (let i = 0; i < 20; i++) {
                    const angle = (i / 20) * Math.PI * 2;
                    const distance = 80;
                    
                    const star = this.add.image(
                        trophyCup.x + Math.cos(angle) * 10,
                        trophyCup.y + Math.sin(angle) * 10,
                        'star'
                    ).setScale(0.3);
                    
                    this.tweens.add({
                        targets: star,
                        x: trophyCup.x + Math.cos(angle) * distance,
                        y: trophyCup.y + Math.sin(angle) * distance,
                        alpha: 0,
                        duration: 1500,
                        delay: i * 50,
                        ease: 'Cubic.easeOut'
                    });
                }
                
                // Play victory sound
                this.sound.play('levelComplete');
            }
        });
    }
    
    restartGame() {
        // Reset game state and start a new game
        resetGameState();
        
        // Transition to game scene
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('GameScene');
        });
    }
    
    returnToMenu() {
        // Reset game state and return to main menu
        resetGameState();
        
        // Transition to main menu
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('MainMenuScene');
        });
    }
}