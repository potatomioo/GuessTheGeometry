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
        // Add background (warehouse image) and ensure it covers the entire screen
        this.add.image(CONFIG.width/2, CONFIG.height/2, 'background')
            .setOrigin(0.5)
            .setDisplaySize(CONFIG.width, CONFIG.height);
        
        // Create conveyor belt
        this.createConveyorBelt();
        
        // Create improved HUD (heads-up display)
        this.createImprovedHUD();
        
        // Create baskets in one row at the bottom
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
    
    createImprovedHUD() {
        // Create a translucent banner across the top for the level indicator
        const topBanner = this.add.rectangle(
            CONFIG.width / 2, 
            30, 
            200, 
            50, 
            0x000000, 
            0.7
        ).setOrigin(0.5, 0.5)
        .setStrokeStyle(2, 0xffffff);
        
        // Level indicator in the center top
        this.levelText = this.add.text(
            CONFIG.width / 2, 
            30, 
            `Level ${GAME_STATE.currentLevel}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);
        
        // Add a glow effect to the level text
        this.levelText.setStroke('#4aff4a', 4);
        this.levelText.setShadow(2, 2, '#000000', 2, true, true);
        
        // Create a score panel in the top left
        const scorePanel = this.add.rectangle(
            20, 
            30, 
            140, 
            50, 
            0x000000, 
            0.7
        ).setOrigin(0, 0.5)
        .setStrokeStyle(2, 0xffff00);
        
        // Score display
        this.scoreText = this.add.text(
            scorePanel.x + 70, 
            scorePanel.y, 
            `Score: ${GAME_STATE.score}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0.5);
        
        // Create a shapes panel below the score panel
        const shapesPanel = this.add.rectangle(
            20, 
            80, 
            140, 
            50, 
            0x000000, 
            0.7
        ).setOrigin(0, 0.5)
        .setStrokeStyle(2, 0xff00ff);
        
        // Shapes remaining counter
        const shapesRemaining = GAME_STATE.shapesPerLevel - GAME_STATE.shapesProcessed;
        this.shapesRemainingText = this.add.text(
            shapesPanel.x + 70, 
            shapesPanel.y, 
            `Shapes: ${shapesRemaining}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff'
            }
        ).setOrigin(0.5, 0.5);
        
        // Add decorative elements
        this.addHUDDecorations();
    }
    
    addHUDDecorations() {
        // Add a pulsing effect to the level indicator
        this.tweens.add({
            targets: this.levelText,
            scale: { from: 1, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add some decorative shapes around the screen edges
        const shapeTypes = ['shape_circle', 'shape_triangle', 'shape_square', 'shape_rectangle'];
        const colors = SHAPE_COLORS;
        
        // Add small decorative shapes to the corners
        for (let i = 0; i < 8; i++) {
            const shapeKey = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            let x, y;
            if (i < 2) {
                // Top right corner
                x = CONFIG.width - 20 - (i * 30);
                y = 20 + (i * 20);
            } else if (i < 4) {
                // Bottom right corner
                x = CONFIG.width - 20 - ((i-2) * 30);
                y = CONFIG.height - 200 - ((i-2) * 20);
            } else if (i < 6) {
                // Top left corner (but not over the HUD)
                x = 180 + ((i-4) * 30);
                y = 20 + ((i-4) * 20);
            } else {
                // Bottom left corner
                x = 20 + ((i-6) * 30);
                y = CONFIG.height - 200 - ((i-6) * 20);
            }
            
            const deco = this.add.image(x, y, shapeKey)
                .setTint(color)
                .setAlpha(0.3)
                .setScale(0.5);
                
            // Add a subtle rotation animation
            this.tweens.add({
                targets: deco,
                angle: 360,
                duration: 10000 + (i * 2000),
                repeat: -1,
                ease: 'Linear'
            });
        }
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
        
        // Add some visual enhancements to the conveyor
        for (let i = 0; i < 10; i++) {
            // Add some highlight lines on the conveyor
            const highlight = this.add.rectangle(
                i * 80, 
                GAME_STATE.dishLineY,
                2,
                80,
                0xffffff,
                0.2
            );
            
            // Add some shadow lines
            this.add.rectangle(
                i * 80 + 4, 
                GAME_STATE.dishLineY,
                2,
                80,
                0x000000,
                0.1
            );
        }
    }
    
    createBaskets() {
        const basketTypes = SHAPE_TYPES;
        const basketCount = basketTypes.length;
        const basketSpacing = CONFIG.width / (basketCount + 1);
        
        // All baskets will now be in a row at the bottom of the screen
        const basketY = CONFIG.height - 100; // Fixed Y position for all baskets
        
        for (let i = 0; i < basketTypes.length; i++) {
            const type = basketTypes[i];
            // Calculate X position to space baskets evenly across the bottom
            const basketX = basketSpacing * (i + 1);
            
            // Create basket shadow
            this.add.image(basketX + 5, basketY + 5, 'basket')
                .setTint(0x000000)
                .setAlpha(0.3);
            
            // Create the basket (using the box.png now)
            const basket = this.add.image(basketX, basketY, 'basket');
            
            // Adjust the scale to better fit the game's UI
            // The scale might need adjustment based on the actual box.png dimensions
            basket.setScale(0.6);
            
            // Add a highlight effect to the basket
            const highlight = this.add.rectangle(
                basketX,
                basketY - 55,
                120,
                10,
                0xffffff,
                0.3
            ).setOrigin(0.5, 0.5);
            
            // Animate the highlight
            this.tweens.add({
                targets: highlight,
                alpha: { from: 0.1, to: 0.5 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Store basket properties for collision
            basket.x = basketX;
            basket.y = basketY;
            basket.shapeType = type;
            this.baskets.push(basket);
            
            // Add shape example in the basket
            const exampleShape = this.add.image(
                basketX, 
                basketY - 20, 
                `shape_${type}`
            ).setTint(0xffffff).setAlpha(0.6).setScale(0.8);
            
            // Add an animation to the example shape
            this.tweens.add({
                targets: exampleShape,
                y: basketY - 25,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Add label with better styling
            const label = this.add.text(
                basketX,
                basketY + 30,
                type.charAt(0).toUpperCase() + type.slice(1),
                {
                    fontFamily: 'Arial',
                    fontSize: '20px',
                    fontStyle: 'bold',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            
            // Add a slight animation to the label
            this.tweens.add({
                targets: label,
                scale: { from: 1, to: 1.05 },
                duration: 1000 + (i * 200),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
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
                
                // Create a visual indicator by changing alpha and scaling up slightly
                clickedShape.alpha = 0.8;
                clickedShape.setScale(1.1);
                
                // Bring to front
                clickedShape.depth = 100;
                
                // Add a subtle glow effect
                clickedShape.setTint(0xffffaa);
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
                
                // Reset visual effects
                shape.alpha = 1;
                shape.setScale(1);
                shape.clearTint();
                
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
                            
                            // Visual feedback - scale down and destroy with more elaborate animation
                            this.tweens.add({
                                targets: shape,
                                scaleX: 0,
                                scaleY: 0,
                                angle: 360,
                                alpha: 0,
                                duration: 400,
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
                            
                            // Visual feedback for wrong basket
                            this.tweens.add({
                                targets: shape,
                                angle: { from: -20, to: 20 },
                                duration: 100,
                                repeat: 3,
                                yoyo: true,
                                onComplete: () => {
                                    shape.angle = 0;
                                    // Return to its dish
                                    this.returnShapeToDish(shape);
                                }
                            });
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
        
        // Add a subtle glow to the dish
        dish.setTint(0xffffee);
        
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
        
        // Add a subtle "pop-in" effect when the shape appears
        shape.setScale(0.5);
        this.tweens.add({
            targets: shape,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
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
        
        // Animate return to dish with a more interesting path
        this.tweens.add({
            targets: shape,
            x: dish.x,
            y: { value: dish.y - 25, duration: 300, ease: 'Bounce.easeOut' },
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
        for (let i = 0; i < 8; i++) {
            const star = this.add.image(x, y, 'star').setScale(0.3 + Math.random() * 0.3);
            
            // Random color tint for stars
            star.setTint(
                Phaser.Display.Color.GetColor(
                    255, 
                    200 + Math.floor(Math.random() * 55), 
                    100 + Math.floor(Math.random() * 155)
                )
            );
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 70;
            
            // Animate star with rotation
            this.tweens.add({
                targets: star,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.1,
                angle: Math.random() * 360,
                duration: 600 + Math.random() * 400,
                ease: 'Cubic.easeOut',
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
            
            // Show level complete effect
            this.showLevelCompleteEffect();
            
            // Check if this was the last level
            if (GAME_STATE.currentLevel >= GAME_STATE.maxLevel) {
                // Game complete!
                this.time.delayedCall(1500, () => {
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
                this.time.delayedCall(1500, () => {
                    this.cameras.main.fade(500, 0, 0, 0);
                    this.time.delayedCall(500, () => {
                        this.scene.start('LevelCompleteScene');
                    });
                });
            }
        }
    }
    
    showLevelCompleteEffect() {
        // Create a level complete text with animation
        const completeText = this.add.text(
            CONFIG.width / 2,
            CONFIG.height / 2,
            'Level Complete!',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0).setScale(0.5);
        
        // Animate the text
        this.tweens.add({
            targets: completeText,
            alpha: 1,
            scale: 1.2,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Add some star effects around the text
                for (let i = 0; i < 20; i++) {
                    this.time.delayedCall(i * 50, () => {
                        this.createStarEffect(
                            CONFIG.width / 2 + (Math.random() * 200 - 100),
                            CONFIG.height / 2 + (Math.random() * 100 - 50)
                        );
                    });
                }
                
                // Scale down after a while
                this.tweens.add({
                    targets: completeText,
                    alpha: 0,
                    scale: 0.8,
                    delay: 1000,
                    duration: 300
                });
            }
        });
    }
}