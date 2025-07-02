import * as Phaser from 'phaser';
import Enemy from './Enemy';
import GameScene from '@/scenes/GameScene';

class Skeleton extends Enemy {

    constructor(scene: GameScene, x: number, y: number, texture: string, group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture, group);
        group.add(this);
        this.setScale(1.2);
        this.velocity = 50;
        this.damage = 10;
        this.create();
        this.setDifficulty(scene.player.lvl);
    }

    setDifficulty(difficulty: number) {
        this.health = 10 * difficulty;
        // Set baseColor to a blue scale based on difficulty (from white to blue)
        // Interpolate from white (255,255,255) to blue (0,0,255)
        const t = Phaser.Math.Clamp((difficulty - 1) / 30, 0, 1);
        const r = Phaser.Math.Interpolation.Linear([255, 0], t);
        const g = Phaser.Math.Interpolation.Linear([255, 0], t);
        const b = 255;
        this.baseColor = Phaser.Display.Color.GetColor(r, g, b);
        this.setTint(this.baseColor);
        this.setScale(1.2 + ((difficulty - 1) * 0.04));
    }

    create() {
        this.body!.setSize(20, 38, true);
        const animsConfig = [
            { key: 'skeleton', frameRate: 10, repeat: -1, action: 'idle' },
            { key: 'skeleton-walk', frameRate: 10, repeat: -1, action: 'walk' },
            { key: 'skeleton-attack', frameRate: 10, repeat: -1, action: 'attack' },
            { key: 'skeleton-death', frameRate: 10, repeat: 0, action: 'death' }
        ];
        this.createAnims(animsConfig);
    }
}

export default Skeleton;
