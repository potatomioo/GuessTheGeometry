class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading graphics
        const loadingText = this.add.text(
            CONFIG.width / 2, 
            CONFIG.height / 2 - 50,
            'Loading...', 
            { 
                font: '24px Arial', 
                fill: '#ffffff' 
            }
        ).setOrigin(0.5);
        
        // Display game title
        this.add.text(
            CONFIG.width / 2,
            CONFIG.height / 2 - 150,
            'Guess The Geometry',
            {
                font: 'bold 48px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Create loading progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(
            CONFIG.width / 2 - 160, 
            CONFIG.height / 2, 
            320, 
            50
        );
        
        // Show progress
        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(
                CONFIG.width / 2 - 150, 
                CONFIG.height / 2 + 10, 
                300 * value, 
                30
            );
        });
        
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        // Reset game state before starting
        resetGameState();
        
        // Move to preload scene
        this.sound.mute = false;
    this.sound.volume = 1;
    
    // Move to preload scene
    this.scene.start('PreloadScene');
    }
}