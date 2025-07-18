import * as Phaser from 'phaser';
import Skill from '../GameObjects/Skill';
import SkillsModal from '@/scenes/SkillsModal';
import GameScene from './GameScene';
import { GlobalDataSingleton } from '@/data/GlobalDataSingleton';

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

    isTouchDevice: boolean = false;

    constructor() {
        super({ key: 'UIOverlay' });
    }

    init() {
        this.experience = 0;
        this.level = 1;
        this.playerHealth = GlobalDataSingleton.instance.calculateStats().health;
    }

    create() {
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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
        coinBg.fillStyle(0x222222, 1);
        coinBg.fillRoundedRect(-60, 0, 120, 24, 8);
        this.coinText = this.add.text(0, 4, `${(this.scene.get('GameScene') as GameScene).totalCoins}`, {
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5, 0);
        this.coinContainer.add([coinBg, this.coinText]);
        const pauseButton = this.add.text(camera.width - 70, camera.height - 50, '||', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#222222',
            padding: { x: 10, y: 5 },
        }).setInteractive();

        pauseButton.on('pointerup', () => {
            this.scene.pause('GameScene'); // pauses GameScene
            if (!this.scene.isActive('PauseModalScene')) {
                this.scene.launch('PauseModalScene');
                this.scene.bringToTop('PauseModalScene');
            } else {
                this.scene.stop('PauseModalScene');
                this.scene.launch('PauseModalScene');
                this.scene.bringToTop('PauseModalScene');
            }
        });


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

        const ratio = Phaser.Math.Clamp(this.playerHealth / GlobalDataSingleton.instance.calculateStats().health, 0, 1);

        this.healthBar.clear();
        this.healthBar.fillStyle(0x880000);
        this.healthBar.fillRoundedRect(x, y, barWidth, barHeight, 8);

        if (this.playerHealth > 0) {
            this.healthBar.fillStyle(0x008000);
            this.healthBar.fillRoundedRect(x, y, barWidth * ratio, barHeight, 8);
        }

        if (!this.isTouchDevice) {
            const healthText = this.playerHealth > 0 ? this.playerHealth : 0;
            this.healthText.setText(`HP: ${healthText} / ${GlobalDataSingleton.instance.calculateStats().health}`);
            this.healthText.setPosition(x + 10, y + 2);
        } else {
            this.healthText.setText('');
        }
    }


    updateExpBar() {
        const camera = this.cameras.main;
        const barWidth = camera.width * 0.3;
        const barHeight = 24;

        const x = camera.scrollX + camera.width - barWidth - 20;
        const y = camera.scrollY + 10;

        const levelXP = 100 * Math.ceil(Math.pow(1.5, this.level - 1));
        const expInLevel = this.experience % levelXP;
        const ratio = Phaser.Math.Clamp(expInLevel / levelXP, 0, 1);
        const fillWidth = Math.floor(barWidth * ratio);

        this.expBar.clear();
        this.expBar.fillStyle(0x222222);
        this.expBar.fillRoundedRect(x, y, barWidth, barHeight, 8);

        if (fillWidth > 0) {
            this.expBar.fillStyle(0x00aaff);
            this.expBar.fillRoundedRect(x, y, fillWidth, barHeight, 8);
        }

        if (!this.isTouchDevice) {
            this.expText.setText(`XP: ${this.experience} / ${levelXP}`);
            this.expText.setPosition(x + 10, y + 2);

            this.levelText.setText(`Lv. ${this.level}`);
            this.levelText.setPosition(x, y + barHeight + 5);
        } else {
            this.expText.setText('');
            this.levelText.setText('');
        }
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
        this.input.manager.pointers.forEach(p => p.reset());

        const modalSceneKey = 'SkillsModal';

        if (!this.scene.get(modalSceneKey)) {
            this.scene.add(modalSceneKey, SkillsModal, false);
        }

        if (this.scene.isActive(modalSceneKey)) {
            this.scene.stop(modalSceneKey);
        }

        this.scene.launch(modalSceneKey, { skills, playerSkills, onSelect });
        this.scene.bringToTop(modalSceneKey);
    }


    shutdown() {
        this.game.events.off('open-skill-modal', this.handleSkillModal, this);
    }
}

export default UIOverlay;
