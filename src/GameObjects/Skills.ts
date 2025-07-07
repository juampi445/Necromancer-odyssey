import Player from "./Player";
import Skill from "./Skill";

export class Comet extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player, 1000, 200, 'comet'); // Call super with cooldown, range, and texture key
        this.lastUsed = 0; // Last time the skill was used
        this.type = 'Comet'; // Type of the skill
        this.lvl = 1; // Initial level of the skill
    }

}

export class Comet2 extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player);
        this.cooldown = 2200; // Cooldown time in milliseconds
        this.range = 1000; // Range of the skill
        this.lastUsed = 500; // Last time the skill was used
        this.projectileKey = 'comet_2'; // Key for the projectile type
        this.type = 'AutoProjectileV2'; // Type of the skill
    }
}

export class Aura extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player, 800, 100, 'aura'); // Call super with cooldown, range, and texture key
        this.lastUsed = 0; // Last time the skill was used
        this.type = 'Aura'; // Type of the skill
        this.areaOfEffect = true; // This skill is an area of effect skill
        this.depth = player.depth - 1; // Set depth to ensure it renders above other objects
        this.setOrigin(0.5, 0.5); // Set origin to center for proper positioning
        this.setVisible(true); // Initially set the aura to not visible
        this.setAlpha(0.2); // Start with alpha 0 for fade-in effect
        this.adjustScaleToRange();

        this.scene.add.tween({
            targets: this,
            alpha: 1,
            duration: this.cooldown/2,
            ease: 'Quad.easeIn',
            yoyo: true,
            repeat: -1 // Repeat indefinitely
        });

        this.setRange = (range: number) => {
            this.range = range;
            this.adjustScaleToRange();
        }
    }

    adjustScaleToRange() {
        const texture = this.scene.textures.get(this.texture.key);
        const frame = texture.getSourceImage();

        const diameter = this.range * 2;
        const scaleX = diameter / frame.width;
        const scaleY = diameter / frame.height;

        this.setScale(scaleX, scaleY);
    }
}

export class Venom extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player, 2200, 500, 'venom'); // Call super with cooldown, range, and texture key
        this.projectileKey = 'venom'; // Key for the projectile type
        this.type = 'Venom';
        this.aoeRange = 40; // Range of the skill
    }

    upgrade() {
        this.damage += 10; // Incrementa el daño de la habilidad
        this.aoeRange += 20; // Incrementa el rango de la habilidad
    }
}

export class Lightning extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player, 2200, 500, 'lightning');
        this.type = 'Lightning';
        this.areaOfEffect = true;
        this.range = scene.cameras.main.height;
        this.quantity = 1;
    }

    useAreaSkill() {
        if (this.canUse()) {
            this.lastUsed = this.scene.time.now;
            const enemiesInRange = this.getEnemiesInRange();
            if (enemiesInRange.length > 0) {
                console.log(this.quantity, 'enemies in range:', enemiesInRange.length);
                const targets = Phaser.Utils.Array.Shuffle(enemiesInRange).slice(0, this.quantity);
                // Create the animation if it doesn't exist
                if (!this.scene.anims.exists('lightning')) {
                    const totalFrames = this.scene.textures.get('lightning').frameTotal;
                    this.scene.anims.create({
                        key: 'lightning',
                        frames: this.scene.anims.generateFrameNumbers('lightning', { start: 0, end: totalFrames - 1 }),
                        frameRate: 16,
                        repeat: 0
                    });
                }
                targets.forEach(enemy => {
                    const lightningAnim = this.scene.add.sprite(enemy.x, enemy.y + 40, 'lightning');
                    lightningAnim.setOrigin(0.5, 1);
                    lightningAnim.play('lightning');
                    enemy.takeDamage(this.damage);
                    lightningAnim.once('animationcomplete', () => {
                        lightningAnim.destroy();
                    });
                });
            }
        }
    }
}
