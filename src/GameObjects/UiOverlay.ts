import * as Phaser from 'phaser';

class UIOverlay extends Phaser.Scene {
    private healthBar!: Phaser.GameObjects.Graphics;
    private scoreText!: Phaser.GameObjects.Text;
    private playerHealth: number = 100;

    constructor() {
        super({ key: 'UIOverlay', active: true });
    }

    create() {
        // Add health bar (a simple green rectangle)
        this.healthBar = this.add.graphics();
        this.updateHealthBar(); // Initial health at 100%

        // Add score text
        this.scoreText = this.add.text(10, 50, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff',
        });

        // Subscribe to the global event emitter
        this.game.events.on('update-health', this.handleHealthUpdate, this);

        // Make UI responsive to window resizing and camera movement
        this.scale.on('resize', this.resizeUI, this);
        this.cameras.main.on('cameraupdate', this.updateUIPosition, this);

        this.resizeUI(); // Initial UI setup
        this.updateUIPosition(); // Initial position based on camera
    }

    handleHealthUpdate(health: number) {
        console.log('Health updated:', health);
        this.playerHealth = health;
        this.updateHealthBar();
    }

    resizeUI() {
        this.updateHealthBar(); // Re-draw the health bar on resize
    }

    updateUIPosition() {
        const camera = this.cameras.main;
        const cameraLeft = camera.scrollX;
        const cameraTop = camera.scrollY;

        const healthBarWidth = camera.width * 0.5;
        const healthBarHeight = 20;

        this.healthBar.clear();
        this.healthBar.fillStyle(0x00ff00); // Green color for health
        this.healthBar.fillRect(cameraLeft + 10, cameraTop + 10, healthBarWidth, healthBarHeight);

        this.scoreText.setPosition(cameraLeft + 10, cameraTop + 50);
    }

    updateHealthBar() {
        const camera = this.cameras.main;
        const healthBarWidth = camera.width * 0.4;
        const healthBarHeight = 20;

        this.healthBar.clear();

        // Draw the red background for lost health
        this.healthBar.fillStyle(0xff0000); // Red color for lost health
        this.healthBar.fillRect(10, 10, healthBarWidth, healthBarHeight);

        // Draw the green foreground for remaining health
        this.healthBar.fillStyle(0x00ff00); // Green color for remaining health
        if (this.playerHealth > 0) {
            this.healthBar.fillRect(10, 10, healthBarWidth * (this.playerHealth / 100), healthBarHeight);
        }
    }
}

export default UIOverlay;
