import * as Phaser from 'phaser';

class UIOverlay extends Phaser.Scene {
    private healthBar!: Phaser.GameObjects.Graphics;
    private playerHealth: number = 100;

    private expBar!: Phaser.GameObjects.Graphics;
    private expText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private experience: number = 0;
    private level: number = 1;

    private modal!: Phaser.GameObjects.Container;
    private modalBackground!: Phaser.GameObjects.Graphics;
    private modalText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIOverlay', active: true });
    }

    create() {
        // Health bar
        this.healthBar = this.add.graphics();
        this.updateHealthBar();

        // Experience bar
        this.expBar = this.add.graphics();
        this.expText = this.add.text(0, 0, '', {
            fontSize: '18px',
            color: '#ffffff',
        });
        this.levelText = this.add.text(0, 0, '', {
            fontSize: '24px',
            color: '#ffffff',
        });
        this.updateExpBar();

        // Events
        this.game.events.on('update-health', this.handleHealthUpdate, this);
        this.game.events.on('update-experience', this.handleExpUpdate, this);
        this.game.events.on('game-win', () => this.showModal("win"), this);
        this.game.events.on('game-over', () => this.showModal("lose"), this);

        this.scale.on('resize', this.resizeUI, this);
        this.cameras.main.on('cameraupdate', this.updateUIPosition, this);

        this.createModal();

        this.resizeUI();
        this.updateUIPosition();
    }

    handleHealthUpdate(health: number) {
        this.playerHealth = health;
        this.updateHealthBar();
    }

    handleExpUpdate(newExp: number, lvl: number) {
        this.experience = newExp;
        this.level = lvl;
        console.log('Experience updated:', this.experience, 'Level:', this.level);
        this.updateExpBar();
    }

    updateHealthBar() {
        const camera = this.cameras.main;
        const width = camera.width * 0.4;
        this.healthBar.clear();
        this.healthBar.fillStyle(0xff0000);
        this.healthBar.fillRect(10, 10, width, 20);
        if (this.playerHealth > 0) {
            this.healthBar.fillStyle(0x00ff00);
            this.healthBar.fillRect(10, 10, width * (this.playerHealth / 100), 20);
        }
    }

    updateExpBar() {
        const camera = this.cameras.main;
        const barWidth = camera.width * 0.3;
        const barHeight = 24;

        const x = camera.scrollX + camera.width - barWidth - 20;
        const y = camera.scrollY + 10;

        const expInLevel = this.experience % (100 * Math.ceil(Math.pow(1.5, this.level - 1))); // Assuming each level requires 100 * level * 2 XP
        const ratio = expInLevel / (100 * Math.ceil(Math.pow(1.5, this.level - 1)));
        const nextLevelXP = 100 * Math.ceil(Math.pow(1.5, this.level - 1));

        // Redraw bar
        this.expBar.clear();
        this.expBar.fillStyle(0x222222);
        this.expBar.fillRoundedRect(x, y, barWidth, barHeight, 8);
        this.expBar.fillStyle(0x00aaff);
        this.expBar.fillRoundedRect(x, y, barWidth * ratio, barHeight, 8);

        // XP text inside the bar
        this.expText.setText(`XP: ${this.experience} / ${nextLevelXP}`);
        this.expText.setPosition(x + 10, y + 2);

        // Level text beside the bar
        this.levelText.setText(`Lv. ${this.level}`);
        this.levelText.setPosition(x, y + barHeight + 5);
    }

    resizeUI() {
        this.updateHealthBar();
        this.updateExpBar();
        this.updateUIPosition();
    }

    updateUIPosition() {
        this.updateHealthBar();
        this.updateExpBar();
    }

    createModal() {
        const { width } = this.cameras.main;

        this.modalBackground = this.add.graphics();
        this.modalBackground.fillStyle(0x000000, 0.8);
        this.modalBackground.fillRoundedRect(-150, -75, 400, 150, 20);

        this.modalText = this.add.text(-120, -40, '', {
            fontSize: '32px',
            color: '#ffffff',
        });

        this.modal = this.add.container(width / 2, -150, [this.modalBackground, this.modalText]);
        this.modal.setDepth(10);
        this.modal.setVisible(false);
    }

    showModal(key: string) {
        const { width, height } = this.cameras.main;

        this.modalText.setText(key === 'win' ? 'Ganaste! \n ;D' : 'Perdiste \n ;D');
        this.modal.setVisible(true);
        this.modal.setPosition(width / 2, -150);

        this.tweens.add({
            targets: this.modal,
            y: height / 2,
            ease: 'Bounce.easeOut',
            duration: 1000,
        });
    }
}

export default UIOverlay;
