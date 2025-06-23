import Player from "./Player";
import Skill from "./Skill";

export class Comet extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player);
        this.cooldown = 1000; // Cooldown time in milliseconds
        this.range = 200; // Range of the skill
        this.lastUsed = 0; // Last time the skill was used
    }

}

export class Comet2 extends Skill {
    constructor(scene: Phaser.Scene, player: Player) {
        super(scene, player);
        this.cooldown = 2200; // Cooldown time in milliseconds
        this.range = 1000; // Range of the skill
        this.lastUsed = 500; // Last time the skill was used
        this.projectileKey = 'comet_2'; // Key for the projectile type
    }
}