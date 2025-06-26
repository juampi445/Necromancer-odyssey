import Player from "./Player";
import Skill from "./Skill";

export class Comet extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player);
        this.cooldown = 1000; // Cooldown time in milliseconds
        this.range = 200; // Range of the skill
        this.lastUsed = 0; // Last time the skill was used
        this.type = 'AutoProjectile'; // Type of the skill
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