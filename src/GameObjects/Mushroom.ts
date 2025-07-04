import * as Phaser from 'phaser';
import Enemy from './Enemy';
import GameScene from '@/scenes/GameScene';

class Mushroom extends Enemy {

    constructor(scene: GameScene, x: number, y: number, texture: string = 'mushroom', group: Phaser.Physics.Arcade.Group, isSpecialEnemy: boolean = false) {
        super(scene, x, y, texture, group, isSpecialEnemy);
        group.add(this);
        this.setScale(1.2);
        this.difficulty = 12; // Default difficulty
        this.velocity = 50;
        this.damage = this.difficulty * this.baseDamage;
        this.health = this.difficulty * this.baseHealth;
        this.create();
    }

    create() {
        const frame = this.scene.textures.getFrame(this.texture.key, 0);
        if (frame) {
            this.setSize(30, 60);
            this.body!.setOffset(
                (frame.width - 30) / 2,
                (frame.height - 60) / 2
            );
        }

        const animsConfig = [
            { key: 'mushroom', frameRate: 4, repeat: -1, action: 'idle' },
            { key: 'mushroom-walk', frameRate: 4, repeat: -1, action: 'walk' },
            { key: 'mushroom-attack', frameRate: 4, repeat: -1, action: 'attack' },
            { key: 'mushroom-death', frameRate: 4, repeat: 0, action: 'death' }
        ];
        this.createAnims(animsConfig);
    }
}

export default Mushroom;
