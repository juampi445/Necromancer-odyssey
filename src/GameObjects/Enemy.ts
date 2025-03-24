class Enemy extends Phaser.Physics.Arcade.Sprite {
    canMove: boolean;
    health: number = 10;
    takingDamage: boolean = false;
    dead: boolean = false;
    isAttacking: boolean = false;
    velocity: number = 40;
    idleAnimKey?: string;
    walkAnimKey?: string;
    attackAnimKey?: string;
    deathAnimKey?: string;
    damage: number = 10;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.canMove = false;
        this.scene.game.events.on('game-over', this.gameOver, this);
        this.spawn();
    }

    createAnims(animsConfig: Phaser.Types.Animations.PlayAnimationConfig[]) {
        animsConfig.forEach((anim) => {
            const animKey = anim.key as string;
            if (!this.anims.exists(animKey)) {
                this.anims.create({
                    key: animKey,
                    frames: this.anims.generateFrameNumbers(animKey, { start: 0, end: this.scene.textures.get(animKey).frameTotal - 1 }),
                    frameRate: anim.frameRate || 10,
                    repeat: anim.repeat || 0
                });
                //@ts-expect-error body es privado
                this[`${anim.action}AnimKey`] = animKey;
            }
        })
    }

    gameOver() {
        this.canMove = false;
        if (this.body) {
            //@ts-expect-error body es privado
            this.body!.setVelocity(0);
            this.body!.enable = false;
        }
        if (this.anims) {
            this.anims.stop();
            this.idle();
        }
    }

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

    walk() {
        if (this.anims.currentAnim?.key !== this.walkAnimKey && this.canMove) {
            this.play(this.walkAnimKey!);
        }
    }

    idle() {
        if (this.anims.currentAnim?.key !== this.idleAnimKey) {
            this.play(this.idleAnimKey!);
        }
    }

    takeDamage(damage: number) {
        if (this.takingDamage || this.dead) return;
        this.takingDamage = true;
        this.health -= damage;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
            this.takingDamage = false;
        });
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;
        this.body!.enable = false;
        this.canMove = false;
        this.setVelocity(0);
        this.anims.stop();
        this.play(this.deathAnimKey!);
        this.on('animationcomplete', () => {
            this.destroy();
        });
    }

    attack() {
        this.setVelocity(0);

        if (this.anims.currentAnim?.key !== this.attackAnimKey && this.canMove) {
            this.play(this.attackAnimKey!);
        }

        this.on('animationupdate', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
            if (animation.key === this.attackAnimKey && frame.index === 7) {
                if (this.canMove) {
                    this.setVelocity(this.velocity);
                }
                //@ts-expect-error body es privado
                if (!this.scene.player.takingDamage) this.scene.player.takeDamage(this.damage);
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
            if (distance > 50 && this.body?.position.y !== playerWorldPos.y) {
                this.scene.physics.moveToObject(this, playerWorldPos, this.velocity);
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

export default Enemy;