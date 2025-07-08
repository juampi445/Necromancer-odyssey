import * as Phaser from 'phaser';
import Skill from '../GameObjects/Skill';
import SkillsModal from '@/GameObjects/SkillsModal';

class UIOverlay extends Phaser.Scene {
    private healthBar!: Phaser.GameObjects.Graphics;
    private healthText!: Phaser.GameObjects.Text;
    private playerHealth: number = 100;

    private expBar!: Phaser.GameObjects.Graphics;
    private expText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private experience: number = 0;
    private level: number = 1;

    private coinContainer!: Phaser.GameObjects.Container;
    private coinText!: Phaser.GameObjects.Text;

    private modal!: Phaser.GameObjects.Container;
    private modalBackground!: Phaser.GameObjects.Graphics;
    private modalText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIOverlay', active: true });
    }

    create() {
        this.healthBar = this.add.graphics();
        this.healthText = this.add.text(0, 0, '', {
            fontSize: '18px',
            color: '#ffffff',
        });
        this.updateHealthBar();

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

        const camera = this.cameras.main;
        this.coinContainer = this.add.container(camera.midPoint.x, camera.scrollY + 10).setDepth(10);
        const coinBg = this.add.graphics();
        coinBg.fillStyle(0x000000, 0.7);
        coinBg.fillRoundedRect(-60, 0, 120, 32, 16);
        this.coinText = this.add.text(0, 5, '0', {
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5, 0);
        this.coinContainer.add([coinBg, this.coinText]);

        // Events
        this.game.events.on('update-health', this.handleHealthUpdate, this);
        this.game.events.on('update-experience', this.handleExpUpdate, this);
        this.game.events.on('update-coins', this.updateCoins, this);
        this.game.events.on('game-win', () => this.showModal("win"), this);
        this.game.events.on('game-over', () => this.showModal("lose"), this);
        this.game.events.on('open-skill-modal', this.handleSkillModal, this);

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
        this.updateExpBar();
    }

    updateCoins(amount: number) {
        this.coinText.setText(`${amount}`);
    }

    updateHealthBar() {
        const camera = this.cameras.main;
        const barWidth = camera.width * 0.3;
        const barHeight = 24;

        const x = camera.scrollX + 20;
        const y = camera.scrollY + 10;

        const ratio = Phaser.Math.Clamp(this.playerHealth / 100, 0, 1);

        this.healthBar.clear();
        this.healthBar.fillStyle(0x880000);
        this.healthBar.fillRoundedRect(x, y, barWidth, barHeight, 8);

        if (this.playerHealth > 0) {
            this.healthBar.fillStyle(0x008000);
            this.healthBar.fillRoundedRect(x, y, barWidth * ratio, barHeight, 8);
        }

        const healthText = this.playerHealth > 0 ? this.playerHealth : 0;

        this.healthText.setText(`HP: ${healthText} / 100`);
        this.healthText.setPosition(x + 10, y + 2);
    }

    updateExpBar() {
        const camera = this.cameras.main;
        const barWidth = camera.width * 0.3;
        const barHeight = 24;

        const x = camera.scrollX + camera.width - barWidth - 20;
        const y = camera.scrollY + 10;

        const expInLevel = this.experience % (100 * Math.ceil(Math.pow(1.5, this.level - 1)));
        const ratio = expInLevel / (100 * Math.ceil(Math.pow(1.5, this.level - 1)));
        const nextLevelXP = 100 * Math.ceil(Math.pow(1.5, this.level - 1));

        this.expBar.clear();
        this.expBar.fillStyle(0x222222);
        this.expBar.fillRoundedRect(x, y, barWidth, barHeight, 8);
        this.expBar.fillStyle(0x00aaff);
        this.expBar.fillRoundedRect(x, y, barWidth * ratio, barHeight, 8);

        this.expText.setText(`XP: ${this.experience} / ${nextLevelXP}`);
        this.expText.setPosition(x + 10, y + 2);

        this.levelText.setText(`Lv. ${this.level}`);
        this.levelText.setPosition(x, y + barHeight + 5);
    }

    resizeUI() {
        this.updateHealthBar();
        this.updateExpBar();
        this.updateUIPosition();
    }

    updateUIPosition() {
        const camera = this.cameras.main;
        this.updateHealthBar();
        this.updateExpBar();
        this.coinContainer.setPosition(camera.midPoint.x, camera.scrollY + 10);
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

        this.modalText.setText(key === 'win' ? '¡Ganaste! \n ;D' : 'Perdiste \n ;D');
        this.modal.setVisible(true);
        this.modal.setPosition(width / 2, -150);

        this.tweens.add({
            targets: this.modal,
            y: height / 2,
            ease: 'Bounce.easeOut',
            duration: 1000,
        });
    }

    private handleSkillModal(
        skills: Skill[],
        playerSkills: Skill[],
        onSelect: (skillType: string, canUnlock: boolean, canUpgrade: boolean) => void
    ) {
        // Reset all active pointer states (fixes stuck touch issue on mobile)
        this.input.manager.pointers.forEach(p => p.reset());

        // Ensure SkillsModal scene is registered only once
        if (!this.scene.get('SkillsModal')) {
            this.scene.add('SkillsModal', SkillsModal, false);
        }

        this.scene.bringToTop('SkillsModal');
        this.scene.launch('SkillsModal', { skills, playerSkills, onSelect });
    }


    shutdown() {
        this.game.events.off('open-skill-modal', this.handleSkillModal, this);
    }
}

export default UIOverlay;
