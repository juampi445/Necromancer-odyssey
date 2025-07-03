import * as Phaser from 'phaser';
import Enemy from './Enemy';
import GameScene from '@/scenes/GameScene';

class Goblin extends Enemy {

    constructor(scene: GameScene, x: number, y: number, texture: string = 'goblin', group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture, group);
        group.add(this);
        this.setScale(1.2);
        this.difficulty = 5; // Default difficulty
        this.velocity = 50;
        this.damage = this.difficulty * this.baseDamage;
        this.health = this.difficulty * this.baseHealth;
        this.create();
    }

    create() {
        const frame = this.scene.textures.getFrame(this.texture.key, 0);
        if (frame) {
            this.setSize(30, 40);
            this.body!.setOffset(
                (frame.width - 30) / 2,
                (frame.height - 40) / 2
            );
        }

        const animsConfig = [
            { key: 'goblin', frameRate: 4, repeat: -1, action: 'idle' },
            { key: 'goblin-walk', frameRate: 4, repeat: -1, action: 'walk' },
            { key: 'goblin-attack', frameRate: 4, repeat: -1, action: 'attack' },
            { key: 'goblin-death', frameRate: 4, repeat: 0, action: 'death' }
        ];
        this.createAnims(animsConfig);
    }
}

export default Goblin;
