import * as Phaser from 'phaser';
import GameScene from '@/scenes/GameScene';

class Coin extends Phaser.Physics.Arcade.Sprite {
    value: number;
    baseValue: number = 10;

    constructor(scene: GameScene, x: number, y: number, texture: string = 'coin', enemyDifficulty: number = 1) {
        super(scene, x, y, texture);
        if (scene.coins) {
            scene.coins.add(this);
        }
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.value = enemyDifficulty * this.baseValue;
        this.create();
    }

    create() {
        console.log('Creating coin:', this.texture.key);
        if (!this.scene.anims.exists(this.texture.key)) {
            this.scene.anims.create({
                key: this.texture.key,
                frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
                    start: 0,
                    end: this.scene.textures.get(this.texture.key).frameTotal - 1,
                }),
                frameRate: 10,
                repeat: -1,
            });
        }
        this.setOrigin(0.5, 0.5);
        this.play(this.texture.key);
        this.setDepth(0); // Ensure the coin is above other objects
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }

    collect(player: Phaser.GameObjects.Sprite, scene: GameScene) {
        this.body!.enable = false;

        const tween = this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            duration: 3000,
            ease: 'Cubic.easeIn',
            onUpdate: () => {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 20) {
                    tween.stop();
                    this.finishCollecting(scene);
                    return;
                }

                const speed = 2;

                const step = Math.min(speed, dist);

                this.x += (dx / dist) * step;
                this.y += (dy / dist) * step;
            }

        });
    }

    finishCollecting(scene: GameScene) {
        if (scene.game) {
            scene.game.events.emit('update-coins', scene.totalCoins + this.value);
            scene.totalCoins += this.value;
            this.destroy();
        }
    }

}

export default Coin;
