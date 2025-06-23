import Enemy from "./Enemy";
import Projectile from "./Projectile";

export function createProjectile(key: string, scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number): Projectile {
    switch (key) {
        case 'comet':
            return new CometProjectile(scene, x, y, target, damage);
        // Add more cases here for other projectile types
        case 'comet_2':
            return new Comet2Projectile(scene, x, y, target, damage);
        // Add more cases here for other projectile types
        default:
            throw new Error(`Unknown projectile key: ${key}`);
    }
}

export class CometProjectile extends Projectile {
    constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number) {
        super(scene, x, y, 'comet', target, damage, { start: 0, end: 13 });
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        // Additional behavior for CometProjectile can be added here
    }
}

export class Comet2Projectile extends Projectile {
    constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number) {
        super(scene, x, y, 'comet_2', target, damage, { start: 13, end: 25 }); // Define the animation range for Comet2Projectile
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        // Additional behavior for CometProjectile can be added here
    }

}