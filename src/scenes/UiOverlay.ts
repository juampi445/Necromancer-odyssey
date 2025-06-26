import * as Phaser from 'phaser';
import Skill from '../GameObjects/Skill'; // adjust path if needed

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

    private handleSkillModal(
        skills: Skill[],
        playerSkills: Skill[],
        onSelect: (skillType: string, canUnlock: boolean, canUpgrade: boolean) => void
    ) {
        const camera = this.cameras.main;
        const container = this.add.container(camera.midPoint.x, camera.midPoint.y).setDepth(20);

        const bg = this.add.rectangle(0, 0, 400, 300, 0x222222, 0.95).setOrigin(0.5);
        container.add(bg);

        const title = this.add.text(0, -120, 'Choose a Skill', {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(title);

        let y = -60;

        skills.forEach(skill => {
            const playerSkill = playerSkills.find(s => s.type === skill.type);
            const hasSkill = !!playerSkill;
            console.log(`Skill: ${skill.type}, Has Skill: ${hasSkill}`);
            const level = playerSkill?.lvl ?? 0;
            const canUpgrade = hasSkill && level < skill.maxLevel;
            const canUnlock = !hasSkill;

            let label = `${skill.type} `;
            if (canUnlock) {
                label += '(Locked) - Unlock';
            } else {
                label += `(Level ${level}/${skill.maxLevel})`;
                if (canUpgrade) label += ' - Upgrade';
            }

            const btn = this.add.text(0, y, label, {
                fontSize: '18px',
                color: canUpgrade || canUnlock ? '#0f0' : '#888',
                backgroundColor: '#333',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            if (canUpgrade || canUnlock) {
                btn.on('pointerdown', () => {
                    console.log(canUnlock, canUpgrade, 'Skill: 00');
                    onSelect(skill.type, canUnlock, canUpgrade);
                    container.destroy(true);
                });
            }

            container.add(btn);
            y += 50;
        });
    }

    shutdown() {
        this.game.events.off('open-skill-modal', this.handleSkillModal, this);
    }
}

export default UIOverlay;
