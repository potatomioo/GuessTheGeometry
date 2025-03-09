// Initialize Phaser game
window.onload = function() {
    // Configure the game instance
    const config = {
        type: Phaser.AUTO,
        width: CONFIG.width,
        height: CONFIG.height,
        backgroundColor: CONFIG.backgroundColor,
        parent: CONFIG.parent,
        physics: CONFIG.physics,
        scene: [
            BootScene,
            PreloadScene,
            MainMenuScene,
            GameScene,
            LevelCompleteScene,
            GameOverScene
        ]
    };

    // Create game instance
    const game = new Phaser.Game(config);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        game.scale.refresh();
    });
};