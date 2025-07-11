interface Skill {
    type: string;
    maxLevel: number;
    texture: { key: string };
}

interface PlayerSkill {
    type: string;
    lvl: number;
}

type OnSelect = (type: string, canUnlock: boolean, canUpgrade: boolean) => void;

export default class SkillsModal extends Phaser.Scene {
    private skills: Skill[] = [];
    private playerSkills: PlayerSkill[] = [];
    private onSelect!: OnSelect;
    private isTouchDevice: boolean = false;

    constructor() {
        super({ key: 'SkillsModal' });
    }

    init(data: { skills: Skill[]; playerSkills: PlayerSkill[]; onSelect: OnSelect }) {
        this.skills = data.skills;
        this.playerSkills = data.playerSkills;
        this.onSelect = data.onSelect;
    }

    create() {
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const { width, height } = this.scale;
        console.log('SkillsModal created with skills:', this.isTouchDevice ? 'Touch device' : 'Non-touch device', this.skills);
        // Smaller modal size
        const modalWidth = width * (!this.isTouchDevice ? 0.6 : 0.9);
        const modalHeight = height * (!this.isTouchDevice ? 0.7 : 0.8);

        const container = this.add.container(width / 2, height / 2);

        const bg = this.add
            .tileSprite(0, 0, modalWidth, modalHeight, 'modal-bg')
            .setOrigin(0.5);
        const overlay = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x797562, 0.75).setOrigin(0.5);
        const border = this.add.rectangle(0, 0, modalWidth, modalHeight)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x000000);

        container.add([bg, overlay, border]);

        const title = this.add.text(0, -modalHeight / 2 + 24, 'Choose a Skill', {
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);
        container.add(title);

        const btnHeight = (modalHeight - 100) / 4;
        const btnWidth = modalWidth * 0.85;
        const spacing = 12;

        this.skills.forEach((skill, i) => {
            const playerSkill = this.playerSkills.find(s => s.type === skill.type);
            const hasSkill = !!playerSkill;
            const level = playerSkill?.lvl ?? 0;
            const canUpgrade = hasSkill && level < skill.maxLevel;
            const canUnlock = !hasSkill;

            const y = -modalHeight / 2 + 90 + (this.isTouchDevice ? 40 : 0) + i * (btnHeight + spacing);
            const btn = this.add.container(0, y);

            const bgRect = this.add.graphics();
            bgRect.fillStyle(0x444444, 1);
            bgRect.lineStyle(2, canUpgrade || canUnlock ? 0x00ff00 : 0x666666, 1);
            bgRect.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
            bgRect.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
            bgRect.setInteractive(new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight), Phaser.Geom.Rectangle.Contains);

            const iconSize = btnHeight * (this.isTouchDevice ? 0.5 : 0.6);
            const icon = this.add.sprite(-btnWidth / 2 + 10 + (iconSize / 2), -btnHeight / 2 + 10 + (iconSize / 2), skill.texture.key)
                .setDisplaySize(iconSize, iconSize);

            const titleText = this.add.text(-btnWidth / 2 + iconSize + 40, -btnHeight / 2 + 10, skill.type, {
                fontSize: '18px',
                color: '#ffffff',
            });

            let label = '';
            if (canUnlock) {
                label = '(Locked) - Unlock';
            } else {
                label = `(Level ${level}/${skill.maxLevel})`;
                if (canUpgrade) label += ' - Upgrade';
            }

            const labelText = this.add.text(
                -btnWidth / 2 + 10, // x: align with titleText
                btnHeight / 2 - 10,             // y: near bottom of button
                label,
                {
                    fontSize: this.isTouchDevice ? '20px' : '16px',
                    color: canUpgrade || canUnlock ? '#0f0' : '#888',
                }
            ).setOrigin(0, 1);

            btn.add([bgRect, icon, titleText, labelText]);
            container.add(btn);

            if (canUpgrade || canUnlock) {
                bgRect.on('pointerup', () => {
                    this.onSelect(skill.type, canUnlock, canUpgrade);
                    this.scene.stop('SkillsModal');
                });
            }
        });
    }
}
