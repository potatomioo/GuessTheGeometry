// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#f9f9f9',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game state variables
let score = 0;
let scoreText;
let shapes = [];
let baskets = [];
let nextShapeTime = 0;
let gameStarted = false;
let gameOver = false;
let shapeSpeed = 0.5; // Reduced speed for easier interaction

// Create game instance
const game = new Phaser.Game(config);

// Preload assets
function preload() {
    // No assets to preload for this simple version
}

// Create game elements
function create() {
    // Create baskets around the screen
    createBaskets(this);
    
    // Set up score display
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        fill: '#000',
        fontFamily: 'Arial'
    });
    
    // Mouse down event
    this.input.on('pointerdown', function(pointer) {
        // Check if we clicked on a shape
        let clickedShape = null;
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            
            // Calculate distance for circle shapes
            if (shape.type === 'circle') {
                const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, shape.x, shape.y);
                if (distance <= shape.radius) {
                    clickedShape = shape;
                    break;
                }
            } 
            // Use bounds for other shapes
            else {
                const bounds = shape.getBounds();
                if (bounds.contains(pointer.x, pointer.y)) {
                    clickedShape = shape;
                    break;
                }
            }
        }
        
        // If we found a shape
        if (clickedShape) {
            // Store the shape as currently dragged
            this.draggingShape = clickedShape;
            
            // Create a visual indicator by changing alpha
            clickedShape.alpha = 0.7;
            
            // Bring to front
            clickedShape.depth = 100;
        }
    }, this);
    
    // Mouse move event
    this.input.on('pointermove', function(pointer) {
        if (this.draggingShape) {
            // Move the shape to the pointer position
            this.draggingShape.x = pointer.x;
            this.draggingShape.y = pointer.y;
        }
    }, this);
    
    // Mouse up event
    this.input.on('pointerup', function(pointer) {
        if (this.draggingShape) {
            const shape = this.draggingShape;
            
            // Reset alpha
            shape.alpha = 1;
            
            // Check if shape is dropped on correct basket
            let scored = false;
            
            // Check each basket
            for (let i = 0; i < baskets.length; i++) {
                const basket = baskets[i];
                
                // Simple distance check for collision
                const distance = Phaser.Math.Distance.Between(shape.x, shape.y, basket.x, basket.y);
                
                if (distance < 80) { // Larger radius for easier matching
                    if (shape.shapeType === basket.shapeType) {
                        // Correct basket
                        scored = true;
                        score += 10;
                        scoreText.setText('Score: ' + score);
                        
                        // Visual feedback - scale down and destroy
                        this.tweens.add({
                            targets: shape,
                            scaleX: 0,
                            scaleY: 0,
                            duration: 300,
                            onComplete: function() {
                                const index = shapes.indexOf(shape);
                                if (index > -1) {
                                    shapes.splice(index, 1);
                                }
                            }
                        });
                    } else {
                        // Wrong basket - fade out and destroy
                        this.tweens.add({
                            targets: shape,
                            alpha: 0,
                            duration: 300,
                            onComplete: function() {
                                const index = shapes.indexOf(shape);
                                if (index > -1) {
                                    shapes.splice(index, 1);
                                }
                            }
                        });
                    }
                    break;
                }
            }
            
            // Reset dragging state
            this.draggingShape = null;
        }
    }, this);
    
    // Start button
    const startButton = this.add.text(config.width / 2, config.height / 2, 'Start Game', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#4a4',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    startButton.setInteractive();
    startButton.on('pointerdown', () => {
        gameStarted = true;
        startButton.destroy();
        
        // First shape after a delay
        nextShapeTime = this.time.now + 1000;
    });
}

// Game update loop
function update(time, delta) {
    if (!gameStarted || gameOver) {
        return;
    }
    
    // Generate new shapes over time
    if (time > nextShapeTime) {
        createRandomShape(this);
        // Next shape after 2-4 seconds
        nextShapeTime = time + Phaser.Math.Between(2000, 4000);
    }
    
    // Move shapes from right to left (like a conveyor belt)
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        
        // Skip shapes being dragged
        if (this.draggingShape === shape) {
            continue;
        }
        
        // Move shape left
        shape.x -= shapeSpeed * delta / 16;
        
        // If shape goes off screen, remove it
        if (shape.x < -50) {
            shapes.splice(i, 1);
        }
    }
}

// Create baskets around the screen
function createBaskets(scene) {
    const basketTypes = ['circle', 'triangle', 'square', 'rectangle'];
    const basketPositions = [
        { x: 120, y: 120 }, // Top left
        { x: config.width - 120, y: 120 }, // Top right
        { x: 120, y: config.height - 120 }, // Bottom left
        { x: config.width - 120, y: config.height - 120 } // Bottom right
    ];
    
    for (let i = 0; i < basketTypes.length; i++) {
        const type = basketTypes[i];
        const pos = basketPositions[i];
        
        // Create basket rectangle
        const basket = scene.add.rectangle(
            pos.x,
            pos.y,
            120,
            120,
            0xffffff,
            0.2
        ).setStrokeStyle(4, 0x000000);
        
        // Store basket properties for collision
        basket.x = pos.x;
        basket.y = pos.y;
        basket.shapeType = type;
        baskets.push(basket);
        
        // Add preview shape inside basket
        let preview;
        switch (type) {
            case 'circle':
                preview = scene.add.circle(pos.x, pos.y, 20, 0x0000ff, 0.5);
                break;
            case 'triangle':
                preview = scene.add.triangle(
                    pos.x, pos.y,
                    0, -20,     // top
                    20, 20,     // bottom right
                    -20, 20,    // bottom left
                    0xff0000, 0.5
                );
                break;
            case 'square':
                preview = scene.add.rectangle(pos.x, pos.y, 40, 40, 0x00ff00, 0.5);
                break;
            case 'rectangle':
                preview = scene.add.rectangle(pos.x, pos.y, 50, 30, 0xffff00, 0.5);
                break;
        }
        
        // Add label
        scene.add.text(
            pos.x,
            pos.y + 70,
            type.charAt(0).toUpperCase() + type.slice(1),
            {
                fontSize: '18px',
                fill: '#000',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
    }
}

// Create a random shape in the center
function createRandomShape(scene) {
    const shapeTypes = ['circle', 'triangle', 'square', 'rectangle'];
    const randomType = shapeTypes[Phaser.Math.Between(0, shapeTypes.length - 1)];
    let shape;
    
    // Create shape based on type
    switch (randomType) {
        case 'circle':
            shape = scene.add.circle(
                config.width + 50, // Start off-screen on the right
                config.height / 2,
                30,
                0x0000ff,
                1
            );
            shape.radius = 30; // Store radius for collision detection
            shape.type = 'circle';
            break;
            
        case 'triangle':
            shape = scene.add.triangle(
                config.width + 50,
                config.height / 2,
                0, -30,     // top
                30, 30,     // bottom right
                -30, 30,    // bottom left
                0xff0000,
                1
            );
            shape.type = 'triangle';
            break;
            
        case 'square':
            shape = scene.add.rectangle(
                config.width + 50,
                config.height / 2,
                60,
                60,
                0x00ff00,
                1
            );
            shape.type = 'square';
            break;
            
        case 'rectangle':
            shape = scene.add.rectangle(
                config.width + 50,
                config.height / 2,
                80,
                40,
                0xffff00,
                1
            );
            shape.type = 'rectangle';
            break;
    }
    
    // Store shape type for collision checking
    shape.shapeType = randomType;
    
    // Add to shapes array
    shapes.push(shape);
    
    return shape;
}