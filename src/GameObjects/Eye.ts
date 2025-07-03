import * as Phaser from 'phaser';
import Enemy from './Enemy';
import GameScene from '@/scenes/GameScene';

class Eye extends Enemy {

    constructor(scene: GameScene, x: number, y: number, texture: string = 'eye', group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture, group);
        group.add(this);
        this.setScale(1.2);
        this.difficulty = 3; // Default difficulty
        this.velocity = 50;
        this.damage = this.difficulty * this.baseDamage;
        this.health = this.difficulty * this.baseHealth;
        this.create();
    }

    create() {
        const frame = this.scene.textures.getFrame(this.texture.key, 0);
        if (frame) {
            this.setSize(30, 30);
            this.body!.setOffset(
                (frame.width - 30) / 2,
                (frame.height - 30) / 2
            );
        }

        const animsConfig = [
            { key: 'eye', frameRate: 4, repeat: -1, action: 'idle' },
            { key: 'eye-walk', frameRate: 4, repeat: -1, action: 'walk' },
            { key: 'eye-attack', frameRate: 4, repeat: -1, action: 'attack' },
            { key: 'eye-death', frameRate: 4, repeat: 0, action: 'death' }
        ];
        this.createAnims(animsConfig);
    }
}

export default Eye;
