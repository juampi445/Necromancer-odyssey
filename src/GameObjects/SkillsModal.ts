interface Skill {
    type: string;
    maxLevel: number;
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

    private scrollWrapper!: Phaser.GameObjects.Container;
    private scrollContainer!: Phaser.GameObjects.Container;
    private scrollMask!: Phaser.Display.Masks.GeometryMask;
    private scrollY = 0;
    private targetScrollY = 0;
    private isDragging = false;
    private dragStartY = 0;
    private dragStartScrollY = 0;
    private scrollAreaHeight = 0;
    private visibleAreaHeight = 0;
    private skillButtons: Phaser.GameObjects.Text[] = [];

    private scrollbar!: Phaser.GameObjects.Rectangle;

    // Store these to use in update()
    private titleHeight = 0;
    private scrollbarInitialY = 0;

    constructor() {
        super({ key: 'SkillsModal' });
    }

    init(data: { skills: Skill[]; playerSkills: PlayerSkill[]; onSelect: OnSelect }) {
        this.skills = data.skills;
        this.playerSkills = data.playerSkills;
        this.onSelect = data.onSelect;
    }

    create() {
        const camera = this.cameras.main;
        const container = this.add.container(camera.midPoint.x, camera.midPoint.y).setDepth(20);

        const bg = this.add
            .tileSprite(0, 0, camera.width / 2, (camera.height / 6) * 4, 'modal-background')
            .setOrigin(0.5);
        container.add(bg);

        this.titleHeight = bg.height / 4;
        const scrollAreaHeight = bg.height * 0.75;
        const scrollbarWidth = 8;
        const scrollAreaWidth = bg.width - 40 - scrollbarWidth - 10;

        this.visibleAreaHeight = scrollAreaHeight;

        const title = this.add
            .text(0, -bg.height / 2 + this.titleHeight / 2 - 5, 'Choose a Skill', {
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
            })
            .setOrigin(0.5);
        container.add(title);

        const btnSpacing = 8;
        const btnHeight = (scrollAreaHeight - 2 * btnSpacing) / 3;

        // Wrapper positioned correctly
        this.scrollWrapper = this.add.container(
            -bg.width / 2 + 20,
            -bg.height / 2 + this.titleHeight - 10
        );
        container.add(this.scrollWrapper);

        // Inner scroll container that moves
        this.scrollContainer = this.add.container(0, 0);
        this.scrollWrapper.add(this.scrollContainer);

        // Create mask matching wrapper area
        const maskShape = this.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(
            camera.midPoint.x - bg.width / 2 + 20,
            camera.midPoint.y - bg.height / 2 + this.titleHeight - 10,
            scrollAreaWidth,
            this.visibleAreaHeight
        );
        this.scrollMask = maskShape.createGeometryMask();
        this.scrollWrapper.setMask(this.scrollMask);

        // Add skill buttons inside scrollContainer
        let y = btnSpacing / 2; // Start with some padding from the top
        this.skills.forEach(skill => {
            const playerSkill = this.playerSkills.find(s => s.type === skill.type);
            const hasSkill = !!playerSkill;
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
                fixedWidth: scrollAreaWidth,
                fixedHeight: btnHeight,
                backgroundColor: '#333',
                padding: { left: 10, right: 10, top: 5, bottom: 5 },
            }).setOrigin(0, 0);

            btn.setInteractive({ useHandCursor: true });

            if (canUpgrade || canUnlock) {
                btn.on('pointerdown', () => {
                    this.onSelect(skill.type, canUnlock, canUpgrade);
                    this.scene.stop();
                    this.scene.remove('SkillsModal');
                });
            }

            this.scrollContainer.add(btn);
            this.skillButtons.push(btn);

            y += btnHeight + btnSpacing;
        });

        this.scrollAreaHeight = y;

        // Scrollbar
        const scrollbarHeight = this.getScrollbarHeight();
        this.scrollbarInitialY = -bg.height / 2 + this.titleHeight - 10;

        this.scrollbar = this.add
            .rectangle(
                bg.width / 2 - 20 - scrollbarWidth / 2,
                this.scrollbarInitialY,
                scrollbarWidth,
                scrollbarHeight,
                0x8b6c28,
                0.9
            )
            .setOrigin(0.5, 0)
            .setScrollFactor(0);
        this.scrollbar.setStrokeStyle(1, 0x604e14);
        container.add(this.scrollbar);

        // Input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localY = pointer.y - (camera.midPoint.y - bg.height / 2 + this.titleHeight - 10);
            const localX = pointer.x - (camera.midPoint.x - bg.width / 2 + 20);
            if (
                localY >= 0 &&
                localY <= this.visibleAreaHeight &&
                localX >= 0 &&
                localX <= scrollAreaWidth + scrollbarWidth + 10
            ) {
                this.isDragging = true;
                this.dragStartY = pointer.y;
                this.dragStartScrollY = this.targetScrollY;
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const delta = pointer.y - this.dragStartY;
                this.setTargetScroll(this.dragStartScrollY - delta);
            }
        });

        this.input.on(
            'wheel',
            (
                _pointer: Phaser.Input.Pointer,
                _go: Phaser.GameObjects.GameObject[],
                _dx: number,
                dy: number
            ) => {
                this.setTargetScroll(this.targetScrollY + dy * 0.5);
            }
        );

        this.setTargetScroll(this.scrollY);
    }

    update() {
        if (!this.sys || !this.sys.isActive() || !this.scrollContainer || !this.scrollbar || !this.skillButtons) return;

        const smoothed = Phaser.Math.Linear(this.scrollY, this.targetScrollY, 0.2);
        if (Math.abs(smoothed - this.scrollY) > 0.5) {
            this.scrollY = smoothed;
            this.scrollContainer.y = -this.scrollY;

            for (const btn of this.skillButtons) {
                const btnTop = btn.y + this.scrollContainer.y;
                const btnBottom = btnTop + btn.height;
                const isVisible = btnBottom > 0 && btnTop < this.visibleAreaHeight;
                if (isVisible) {
                    btn.setInteractive({ useHandCursor: true });
                } else {
                    btn.disableInteractive();
                }
            }

            const scrollRatio = this.scrollY / Math.max(1, this.scrollAreaHeight - this.visibleAreaHeight);
            const scrollbarTrack = this.visibleAreaHeight - this.scrollbar.height;

            this.scrollbar.y = this.scrollbarInitialY + scrollRatio * scrollbarTrack;
        }
    }

    shutdown() {
        this.sys.events.off('update', this.update, this);
    }

    private setTargetScroll(y: number) {
        const maxScroll = Math.max(0, this.scrollAreaHeight - this.visibleAreaHeight);
        this.targetScrollY = Phaser.Math.Clamp(y, 0, maxScroll);
    }

    private getScrollbarHeight(): number {
        const ratio = this.visibleAreaHeight / Math.max(0, this.scrollAreaHeight);
        return Phaser.Math.Clamp(ratio * this.visibleAreaHeight, 20, this.visibleAreaHeight);
    }
}
