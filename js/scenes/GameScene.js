class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Initialize variables
        this.dishes = [];
        this.shapes = [];
        this.baskets = [];
        this.nextDishTime = 0;
        this.levelText = null;
        this.scoreText = null;
        this.shapesRemainingText = null;
        this.currentDishSpeed = GAME_STATE.speeds[GAME_STATE.currentLevel];
        this.currentDishSpacing = GAME_STATE.dishSpacing[GAME_STATE.currentLevel];
        this.draggingShape = null;
        this.isTransitioning = false;
        this.dishIdCounter = 0;
    }

    create() {
        // Add background
        this.add.image(0, 0, 'background').setOrigin(0);
        
        // Create HUD (heads-up display)
        this.createHUD();
        
        // Create conveyor belt
        this.createConveyorBelt();
        
        // Create baskets
        this.createBaskets();
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Set time for first dish
        this.nextDishTime = this.time.now + 1000;
    }
    
    update(time, delta) {
        // Create new dishes with shapes periodically
        if (time > this.nextDishTime && !this.isTransitioning) {
            // Create a new dish with a shape
            const dish = this.createDish(CONFIG.width + 50);
            this.createRandomShape(dish);
            
            // Set time for next dish based on level speed and spacing
            this.nextDishTime = time + this.currentDishSpacing / (this.currentDishSpeed * delta / 16);
        }
        
        // Move dishes and shapes from right to left
        for (let i = this.dishes.length - 1; i >= 0; i--) {
            const dish = this.dishes[i];
            
            // Move the dish
            dish.x -= this.currentDishSpeed * delta / 16;
            
            // Find the shape on this dish
            const shapeIndex = this.shapes.findIndex(shape => shape.dishId === dish.id);
            
            if (shapeIndex !== -1) {
                const shape = this.shapes[shapeIndex];
                
                // Only move the shape if it's not being dragged
                if (this.draggingShape !== shape && !shape.isReturning) {
                    shape.x = dish.x;
                }
            }
            
            // If dish goes off screen, remove it and its shape
            if (dish.x < -100) {
                // Remove any shape on this dish
                if (shapeIndex !== -1) {
                    this.shapes[shapeIndex].destroy();
                    this.shapes.splice(shapeIndex, 1);
                    
                    // Update shapes processed count
                    GAME_STATE.shapesProcessed++;
                    this.updateShapesRemainingText();
                    
                    // Check if we've reached the level limit
                    this.checkLevelComplete();
                }
                
                // Remove the dish
                this.dishes.splice(i, 1);
                dish.destroy();
            }
        }
        
        // Update conveyor belt animation
        if (this.conveyorTileSprite) {
            this.conveyorTileSprite.tilePositionX += this.currentDishSpeed * delta / 16;
        }
    }
    
    createHUD() {
        // Level indicator
        this.levelText = this.add.text(
            20, 
            20, 
            `Level: ${GAME_STATE.currentLevel}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        
        // Score display
        this.scoreText = this.add.text(
            20, 
            60, 
            `Score: ${GAME_STATE.score}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
        
        // Shapes remaining counter
        const shapesRemaining = GAME_STATE.shapesPerLevel - GAME_STATE.shapesProcessed;
        this.shapesRemainingText = this.add.text(
            20, 
            100, 
            `Shapes: ${shapesRemaining}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );
    }
    
    updateShapesRemainingText() {
        const shapesRemaining = GAME_STATE.shapesPerLevel - GAME_STATE.shapesProcessed;
        this.shapesRemainingText.setText(`Shapes: ${shapesRemaining}`);
    }
    
    createConveyorBelt() {
        // Create conveyor belt background
        this.conveyorTileSprite = this.add.tileSprite(
            CONFIG.width / 2,
            GAME_STATE.dishLineY,
            CONFIG.width,
            80,
            'conveyor'
        );
        
        // Add top and bottom borders
        this.add.rectangle(CONFIG.width / 2, GAME_STATE.dishLineY - 40, CONFIG.width, 4, 0x333333);
        this.add.rectangle(CONFIG.width / 2, GAME_STATE.dishLineY + 40, CONFIG.width, 4, 0x333333);
    }
    
    createBaskets() {
        const basketTypes = SHAPE_TYPES;
        const basketPositions = [
            { x: 120, y: 150 },  // Top left
            { x: CONFIG.width - 120, y: 150 },  // Top right
            { x: 120, y: CONFIG.height - 150 },  // Bottom left
            { x: CONFIG.width - 120, y: CONFIG.height - 150 }  // Bottom right
        ];
        
        for (let i = 0; i < basketTypes.length; i++) {
            const type = basketTypes[i];
            const pos = basketPositions[i];
            
            // Create basket shadow
            this.add.image(pos.x + 5, pos.y + 5, 'basket')
                .setTint(0x000000)
                .setAlpha(0.3);
            
            // Create the basket
            const basket = this.add.image(pos.x, pos.y, 'basket');
            
            // Store basket properties for collision
            basket.x = pos.x;
            basket.y = pos.y;
            basket.shapeType = type;
            this.baskets.push(basket);
            
            // Add shape example in the basket
            const exampleShape = this.add.image(
                pos.x, 
                pos.y - 20, 
                `shape_${type}`
            ).setTint(0xffffff).setAlpha(0.5).setScale(0.8);
            
            // Add label
            this.add.text(
                pos.x,
                pos.y + 25,
                type.charAt(0).toUpperCase() + type.slice(1),
                {
                    fontFamily: 'Arial',
                    fontSize: '20px',
                    fontStyle: 'bold',
                    color: '#000000'
                }
            ).setOrigin(0.5);
        }
    }
    
    setupInputHandlers() {
        // Mouse down event
        this.input.on('pointerdown', (pointer) => {
            // Don't allow interactions if we're transitioning
            if (this.isTransitioning) return;
            
            // Check if we clicked on a shape
            let clickedShape = null;
            
            for (let i = 0; i < this.shapes.length; i++) {
                const shape = this.shapes[i];
                
                // Skip shapes that are already being animated to return
                if (shape.isReturning) continue;
                
                // Check if pointer is over shape
                if (Phaser.Geom.Rectangle.Contains(shape.getBounds(), pointer.x, pointer.y)) {
                    clickedShape = shape;
                    break;
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
        });
        
        // Mouse move event
        this.input.on('pointermove', (pointer) => {
            if (this.draggingShape) {
                // Move the shape to the pointer position
                this.draggingShape.x = pointer.x;
                this.draggingShape.y = pointer.y;
            }
        });
        
        // Mouse up event
        this.input.on('pointerup', (pointer) => {
            if (this.draggingShape) {
                const shape = this.draggingShape;
                
                // Reset alpha
                shape.alpha = 1;
                
                // Check if shape is dropped on correct basket
                let scored = false;
                
                // Check each basket
                for (let i = 0; i < this.baskets.length; i++) {
                    const basket = this.baskets[i];
                    
                    // Simple distance check for collision
                    const distance = Phaser.Math.Distance.Between(shape.x, shape.y, basket.x, basket.y);
                    
                    if (distance < 60) { // Distance for basket collision
                        if (shape.shapeType === basket.shapeType) {
                            // Correct basket
                            scored = true;
                            GAME_STATE.score += 10;
                            this.scoreText.setText(`Score: ${GAME_STATE.score}`);
                            
                            // Play correct sound if available
                            if (this.cache.audio.exists('correct')) {
                                this.sound.play('correct');
                            }
                            
                            // Visual feedback - shape shrinks and stars appear
                            this.createStarEffect(shape.x, shape.y);
                            
                            // Update shapes processed count
                            GAME_STATE.shapesProcessed++;
                            this.updateShapesRemainingText();
                            
                            // Visual feedback - scale down and destroy
                            this.tweens.add({
                                targets: shape,
                                scaleX: 0,
                                scaleY: 0,
                                duration: 300,
                                onComplete: () => {
                                    const index = this.shapes.indexOf(shape);
                                    if (index > -1) {
                                        this.shapes.splice(index, 1);
                                    }
                                    shape.destroy();
                                    
                                    // Check if level is complete
                                    this.checkLevelComplete();
                                }
                            });
                        } else {
                            // Wrong basket - play sound if available
                            if (this.cache.audio.exists('wrong')) {
                                this.sound.play('wrong');
                            }
                            
                            // Return to its dish
                            this.returnShapeToDish(shape);
                        }
                        break;
                    }
                }
                
                // If not dropped on any basket, return to its dish
                if (!scored) {
                    this.returnShapeToDish(shape);
                }
                
                // Reset dragging state
                this.draggingShape = null;
            }
        });
    }
    
    createDish(x) {
        // Create the dish visual
        const dish = this.add.image(x, GAME_STATE.dishLineY, 'dish');
        
        // Give dish a unique ID
        dish.id = this.dishIdCounter++;
        
        // Properties for the dish
        dish.hasShape = false; // Will be true when a shape is on it
        
        // Add to the dishes array
        this.dishes.push(dish);
        
        return dish;
    }
    
    createRandomShape(dish) {
        const shapeTypes = SHAPE_TYPES;
        const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        // Position the shape above the dish
        const xPos = dish.x;
        const yPos = dish.y - 25; // Position above the dish
        
        // Random color
        const color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
        
        // Create shape
        const shape = this.add.image(xPos, yPos, `shape_${randomType}`).setTint(color);
        
        // Store shape type for collision checking
        shape.shapeType = randomType;
        
        // Associate shape with dish
        shape.dishId = dish.id;
        dish.hasShape = true;
        
        // Ensure the shape is in front of the dish
        shape.setDepth(10);
        
        // Add to shapes array
        this.shapes.push(shape);
        
        return shape;
    }
    
    returnShapeToDish(shape) {
        // Find the associated dish
        const dish = this.dishes.find(d => d.id === shape.dishId);
        if (!dish) return; // Guard clause in case dish is gone
        
        // Mark the shape as being returned (to prevent picking it during animation)
        shape.isReturning = true;
        
        // Animate return to dish
        this.tweens.add({
            targets: shape,
            x: dish.x,
            y: dish.y - 25, // Position above the dish
            duration: 300,
            onComplete: () => {
                shape.isReturning = false;
                dish.hasShape = true;
                
                // Ensure the shape is properly aligned with its dish
                shape.x = dish.x;
                shape.y = dish.y - 25;
                
                // Reset depth
                shape.setDepth(10);
            }
        });
    }
    
    createStarEffect(x, y) {
        // Create stars burst effect on correct match
        for (let i = 0; i < 5; i++) {
            const star = this.add.image(x, y, 'star').setScale(0.5);
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            
            // Animate star
            this.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.1,
                duration: 500,
                onComplete: () => {
                    star.destroy();
                }
            });
        }
    }
    
    checkLevelComplete() {
        // Check if we've processed enough shapes for this level
        if (GAME_STATE.shapesProcessed >= GAME_STATE.shapesPerLevel) {
            // Prevent new shapes from spawning
            this.isTransitioning = true;
            
            // Play level complete sound if available
            if (this.cache.audio.exists('levelComplete')) {
                this.sound.play('levelComplete');
            }
            
            // Check if this was the last level
            if (GAME_STATE.currentLevel >= GAME_STATE.maxLevel) {
                // Game complete!
                this.time.delayedCall(1000, () => {
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start('GameOverScene', { win: true });
                    });
                });
            } else {
                // Move to next level
                GAME_STATE.currentLevel++;
                GAME_STATE.shapesProcessed = 0;
                
                // Transition to level complete scene
                this.time.delayedCall(1000, () => {
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start('LevelCompleteScene');
                    });
                });
            }
        }
    }
}