import * as Phaser from 'phaser';

class Skeleton extends Phaser.Physics.Arcade.Sprite {
    canMove: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, group: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture);

        group.add(this);
        scene.add.existing(this);

        scene.physics.add.existing(this);

        this.setScale(1.2);
        this.setCollideWorldBounds(true);
        this.canMove = false;
        this.create();
    }

    create() {
        this.body!.setSize(20, 38, true);

        if (!this.scene.anims.exists('skeleton')) {
            this.scene.anims.create({
                key: 'skeleton',
                frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('skeleton-walk')) {
            this.scene.anims.create({
                key: 'skeleton-walk',
                frames: this.anims.generateFrameNumbers('skeletonwalk', { start: 0, end: 9 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('skeleton-attack')) {
            this.scene.anims.create({
                key: 'skeleton-attack',
                frames: this.anims.generateFrameNumbers('skeleton-attack', { start: 0, end: 9 }),
                frameRate: 10,
                repeat: -1
            });
        }

        this.spawn();
    }

    walk() {
        if (this.anims.currentAnim?.key !== 'skeleton-walk' && this.canMove) {
            this.play('skeleton-walk');
        }
    }

    idle() {
        if (this.anims.currentAnim?.key !== 'skeleton' && this.canMove) {
            this.play('skeleton');
        }
    }

    attack() {
        this.setVelocity(0);
    
        if (this.anims.currentAnim?.key !== 'skeleton-attack' && this.canMove) {
            this.play('skeleton-attack');
        }

        this.on('animationupdate', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === 'skeleton-attack' && frame.index === 7) {
              // Aquí se detecta el inicio de cada repetición
              
              // Coloca tu lógica aquí, por ejemplo:
              if (this.canMove) {
                this.setVelocity(80);
            }
            //@ts-expect-error body es privado
            if (!this.scene.player.takingDamage) this.scene.player.takeDamage(1);
            }
          });
    }

    
    // se buguea hard


    // attack() {
    //     this.setVelocity(0);
    
    //     if (this.anims.currentAnim?.key !== 'skeleton-attack' && this.canMove) {
    //         this.play('skeleton-attack');
    //     }

    //     this.on('animationupdate', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
    //         if (animation.key === 'skeleton-attack' && this.canMove) {
    //             const totalFrames = animation.frames.length;
    //             const repeatFrame = totalFrames - 3;
    
    //             if (frame.index === repeatFrame) {
    //                 this.setVelocity(80);
    //                 //@ts-expect-error body is private
    //                 this.scene.player.takeDamage(1);
    //             }
    //         }
    //     });
    // }
    

    spawn() {
        this.canMove = false;
        this.setAlpha(0);
        this.idle();
        this.scene.add.tween({
            targets: this,
            alpha: 1,
            duration: 500,
            ease: 'Linear',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.canMove = true;
                this.idle();
                this.setAlpha(1);
            }
        });
    }
    preUpdate(time: number, delta: number) {
        this.update();
        this.anims.update(time, delta);
    }

    update() {
        if (this.canMove) {
            //@ts-expect-error body is private
            const playerWorldPos = this.scene.player.body.position;

            const distance = Phaser.Math.Distance.Between(this.body!.position.x, this.body!.position.y, playerWorldPos.x, playerWorldPos.y);
            if (distance > 30 && this.body?.position.y !== playerWorldPos.y) {
                this.scene.physics.moveToObject(this, playerWorldPos, 80);
                if (playerWorldPos.x < this.body!.position.x) {
                    this.setFlipX(true);
                } else {
                    this.setFlipX(false);
                }
                this.walk();
            } else {
                (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
                this.attack();
            }
        }
    }
}

export default Skeleton;
