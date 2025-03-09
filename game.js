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
let dishes = [];
let baskets = [];
let nextDishTime = 0;
let gameStarted = false;
let gameOver = false;
let dishSpeed = 1; // Speed of dishes moving
let shapeLineY = 350; // Fixed Y position for shape line
let conveyorBelt; // Visual base for shapes
let dishDistance = 1500; // Fixed distance between dishes

// Create game instance
const game = new Phaser.Game(config);

// Preload assets
function preload() {
    // No assets to preload for this simple version
}

// Create game elements
function create() {
    // Add a title
    this.add.text(config.width / 2, 40, 'Shape Sorter', {
        fontSize: '36px',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#333'
    }).setOrigin(0.5);
    
    // Create a conveyor belt visual (base for shapes)
    createConveyorBelt(this);
    
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
            
            // Skip shapes that are already being animated to return
            if (shape.isReturning) continue;
            
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
            
            // Remember which dish it belongs to
            clickedShape.dish.hasShape = false;
            
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
                        
                        // Keep the shape where it was dropped
                        const dropX = shape.x;
                        const dropY = shape.y;
                        
                        // Visual feedback - scale down and destroy at the drop location
                        this.tweens.add({
                            targets: shape,
                            x: dropX, // Keep x position where it was dropped
                            y: dropY, // Keep y position where it was dropped
                            scaleX: 0,
                            scaleY: 0,
                            duration: 300,
                            onComplete: function() {
                                const index = shapes.indexOf(shape);
                                if (index > -1) {
                                    shapes.splice(index, 1);
                                }
                                shape.dish.hasShape = false;
                                shape.destroy();
                            }
                        });
                    } else {
                        // Wrong basket - return to its dish
                        returnShapeToDish(this, shape);
                    }
                    break;
                }
            }
            
            // If not dropped on any basket, return to its dish
            if (!scored) {
                returnShapeToDish(this, shape);
            }
            
            // Reset dragging state
            this.draggingShape = null;
        }
    }, this);
    
    // Start button
    const startButton = this.add.rectangle(config.width / 2, config.height / 2, 200, 70, 0x4CAF50);
    const startText = this.add.text(config.width / 2, config.height / 2, 'Start Game', {
        fontSize: '28px',
        fontFamily: 'Arial',
        fill: '#fff'
    }).setOrigin(0.5);
    
    // Group button and text in a container
    const startButtonContainer = this.add.container(0, 0, [startButton, startText]);
    startButtonContainer.setInteractive(new Phaser.Geom.Rectangle(config.width / 2 - 100, config.height / 2 - 35, 200, 70), Phaser.Geom.Rectangle.Contains);
    
    startButtonContainer.on('pointerdown', () => {
        gameStarted = true;
        startButtonContainer.destroy();
        
        // First dish after a delay
        nextDishTime = this.time.now + 1000;
    });
    
    // Make button interactive on hover
    startButtonContainer.on('pointerover', () => {
        startButton.fillColor = 0x3e8e41;
    });
    
    startButtonContainer.on('pointerout', () => {
        startButton.fillColor = 0x4CAF50;
    });
}

// Helper function to return a shape to its dish
function returnShapeToDish(scene, shape) {
    // Mark the shape as being returned (to prevent picking it during animation)
    shape.isReturning = true;
    
    // Animate return to dish
    scene.tweens.add({
        targets: shape,
        x: shape.dish.x,
        y: shape.dish.y - 15, // Position slightly above the dish
        duration: 300,
        onComplete: function() {
            shape.isReturning = false;
            shape.dish.hasShape = true;
            
            // Make sure shape is properly aligned with its dish
            shape.x = shape.dish.x;
            shape.y = shape.dish.y - 15;
            
            // Ensure the shape is in front of the dish
            shape.setDepth(10);
        }
    });
}

// Create a visual conveyor belt for the shapes to ride on
function createConveyorBelt(scene) {
    // Belt background
    const beltBackground = scene.add.rectangle(config.width / 2, shapeLineY + 30, config.width, 60, 0xaaaaaa);
    
    // Add conveyor belt lines
    for (let i = 0; i < 20; i++) {
        const line = scene.add.line(
            i * 40, 0,
            0, shapeLineY + 10,
            0, shapeLineY + 50,
            0x888888
        ).setOrigin(0, 0);
        
        // Add the line to the scene
        scene.add.existing(line);
    }
    
    // Add borders to the belt
    scene.add.rectangle(config.width / 2, shapeLineY, config.width, 4, 0x666666);
    scene.add.rectangle(config.width / 2, shapeLineY + 60, config.width, 4, 0x666666);
}

// Create a dish to hold a shape
function createDish(scene, x) {
    // Create the dish visual (a small plate/bowl)
    // Make dish bigger to better hold shapes
    const dish = scene.add.ellipse(x, shapeLineY + 15, 70, 25, 0xdddddd);
    dish.setStrokeStyle(2, 0x888888);
    
    // Add a slight 3D effect to make it look more like a dish
    const dishHighlight = scene.add.ellipse(x, shapeLineY + 13, 60, 15, 0xeeeeee);
    dishHighlight.setAlpha(0.5);
    
    // Properties for the dish
    dish.hasShape = false; // Will be true when a shape is on it
    
    // Add to the dishes array
    dishes.push(dish);
    
    return dish;
}

// Game update loop
function update(time, delta) {
    if (!gameStarted || gameOver) {
        return;
    }
    
    // Create new dishes with shapes periodically
    if (time > nextDishTime) {
        // Create a new dish with a shape
        const dish = createDish(this, config.width + 50);
        createRandomShape(this, dish);
        
        // Set time for next dish
        nextDishTime = time + dishDistance / (dishSpeed * delta / 16);
    }
    
    // Move dishes and shapes from right to left
    for (let i = dishes.length - 1; i >= 0; i--) {
        const dish = dishes[i];
        
        // Move the dish
        dish.x -= dishSpeed * delta / 16;
        
        // Find the shape on this dish
        const shapeIndex = shapes.findIndex(shape => shape.dish === dish);
        
        if (shapeIndex !== -1) {
            const shape = shapes[shapeIndex];
            
            // Only move the shape if it's not being dragged
            if (this.draggingShape !== shape && !shape.isReturning) {
                shape.x = dish.x;
            }
        }
        
        // If dish goes off screen, remove it and its shape
        if (dish.x < -100) {
            // Remove any shape on this dish
            if (shapeIndex !== -1) {
                shapes[shapeIndex].destroy();
                shapes.splice(shapeIndex, 1);
            }
            
            // Remove the dish
            dishes.splice(i, 1);
            dish.destroy();
        }
    }
}

// Create baskets around the screen
function createBaskets(scene) {
    const basketTypes = ['circle', 'triangle', 'square', 'rectangle'];
    const basketPositions = [
        { x: 200, y: 120 }, // Top left
        { x: config.width - 200, y: 120 }, // Top right
        { x: 200, y: config.height - 120 }, // Bottom left
        { x: config.width - 200, y: config.height - 120 } // Bottom right
    ];
    
    for (let i = 0; i < basketTypes.length; i++) {
        const type = basketTypes[i];
        const pos = basketPositions[i];
        
        // Create fancier basket with shadow
        const basketShadow = scene.add.rectangle(
            pos.x + 5,
            pos.y + 5,
            122,
            122,
            0x000000,
            0.3
        );
        
        // Create basket rectangle
        const basket = scene.add.rectangle(
            pos.x,
            pos.y,
            120,
            120,
            0xffffff,
            0.9
        ).setStrokeStyle(4, 0x000000);
        
        // Store basket properties for collision
        basket.x = pos.x;
        basket.y = pos.y;
        basket.shapeType = type;
        baskets.push(basket);
        
        // Add label with shadow
        const labelShadow = scene.add.text(
            pos.x + 2,
            pos.y + 2,
            type.charAt(0).toUpperCase() + type.slice(1),
            {
                fontSize: '24px',
                fill: '#000000',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5).setAlpha(0.3);
        
        const label = scene.add.text(
            pos.x,
            pos.y,
            type.charAt(0).toUpperCase() + type.slice(1),
            {
                fontSize: '24px',
                fill: '#333333',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5);
    }
}

// Get a random color
function getRandomColor() {
    const colors = [
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
    
    return colors[Phaser.Math.Between(0, colors.length - 1)];
}

// Create a random shape on a dish
function createRandomShape(scene, dish) {
    const shapeTypes = ['circle', 'triangle', 'square', 'rectangle'];
    const randomType = shapeTypes[Phaser.Math.Between(0, shapeTypes.length - 1)];
    
    // Position the shape directly above the center of the dish
    const xPos = dish.x;
    const yPos = dish.y - 15; // Position slightly above the dish
    
    // Random color
    const color = getRandomColor();
    
    let shape;
    let trianglePoints = null; // Store triangle points for shadow later
    
    // Create shape based on type with variations
    switch (randomType) {
        case 'circle':
            // Random radius between 20 and 25 (smaller to fit on dish better)
            const radius = Phaser.Math.Between(20, 25);
            shape = scene.add.circle(
                xPos,
                yPos,
                radius,
                color,
                1
            );
            shape.radius = radius; // Store radius for collision detection
            shape.type = 'circle';
            break;
            
        case 'triangle':
            // Different triangle shapes (smaller sizes to fit on dish)
            const triangleType = Phaser.Math.Between(0, 2);
            
            if (triangleType === 0) {
                // Equilateral
                const size = Phaser.Math.Between(20, 25);
                trianglePoints = [
                    0, -size,          // top
                    size, size,         // bottom right
                    -size, size          // bottom left
                ];
            } else if (triangleType === 1) {
                // Right angle
                const size = Phaser.Math.Between(20, 25);
                trianglePoints = [
                    -size, -size,      // top left
                    size, -size,       // top right
                    -size, size        // bottom left
                ];
            } else {
                // Isosceles
                const width = Phaser.Math.Between(25, 30);
                const height = Phaser.Math.Between(25, 30);
                trianglePoints = [
                    0, -height/2,      // top
                    width/2, height/2, // bottom right
                    -width/2, height/2 // bottom left
                ];
            }
            
            shape = scene.add.triangle(
                xPos,
                yPos,
                trianglePoints[0], trianglePoints[1],
                trianglePoints[2], trianglePoints[3],
                trianglePoints[4], trianglePoints[5],
                color,
                1
            );
            shape.type = 'triangle';
            shape.trianglePoints = trianglePoints; // Save for later use
            break;
            
        case 'square':
            // Smaller square size to fit on dish
            const squareSize = Phaser.Math.Between(30, 40);
            shape = scene.add.rectangle(
                xPos,
                yPos,
                squareSize,
                squareSize,
                color,
                1
            );
            shape.type = 'square';
            break;
            
        case 'rectangle':
            // Smaller width and height for rectangle to fit on dish
            const width = Phaser.Math.Between(35, 45);
            const height = Phaser.Math.Between(20, 30);
            shape = scene.add.rectangle(
                xPos,
                yPos,
                width,
                height,
                color,
                1
            );
            shape.type = 'rectangle';
            break;
    }
    
    // Store shape type for collision checking
    shape.shapeType = randomType;
    
    // Add a subtle 3D effect with a stroke
    shape.setStrokeStyle(2, 0xffffff, 0.5);
    
    // Make sure all shapes are interactive
    shape.setInteractive();
    
    // Associate shape with dish
    shape.dish = dish;
    dish.hasShape = true;
    
    // Ensure the shape is in front of the dish
    shape.setDepth(10);
    
    // Add to shapes array
    shapes.push(shape);
    
    return shape;
}