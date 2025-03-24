import * as Phaser from 'phaser';
import Enemy from './Enemy';

class Skeleton extends Enemy {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture);
        group.add(this);
        this.setScale(1.2);
        this.velocity = 60;
        this.damage = 10;
        this.create();
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
