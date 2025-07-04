import GameScene from "@/scenes/GameScene";
import Coin from "./Coin";

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
  group: Phaser.Physics.Arcade.Group;
  scene: GameScene;
  hasAttackListener: boolean = false;
  baseColor?: number;
  difficulty: number = 1;
  baseDamage: number = 10;
  baseHealth: number = 10;
  isSpecialEnemy: boolean = false;

  constructor(scene: GameScene, x: number, y: number, texture: string = 'skeleton', group: Phaser.Physics.Arcade.Group, isSpecialEnemy: boolean = false) {
    super(scene, x, y, texture);
    this.group = group;
    this.scene = scene;
    this.isSpecialEnemy = isSpecialEnemy;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    this.canMove = false;
    // this.scene.game.events.on('game-over', this.gameOver, this);
    if (isSpecialEnemy) {
      this.baseColor = 0x66ccff;
      this.setTint(this.baseColor);
      this.baseHealth = this.baseHealth * 10;
    }
    this.spawn();
  }

  createAnims(animsConfig: Phaser.Types.Animations.PlayAnimationConfig[]) {
    animsConfig.forEach((anim) => {
      const animKey = anim.key as string;
      if (!this.anims.exists(animKey)) {
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(animKey, {
            start: 0,
            end: this.scene.textures.get(animKey).frameTotal - 1,
          }),
          frameRate: anim.frameRate || 10,
          repeat: anim.repeat || 0,
        });
        //@ts-expect-error body es privado
        this[`${anim.action}AnimKey`] = animKey;
      }
    });
  }

  gameOver() {
    this.canMove = false;
    if (this.body) {
      //@ts-expect-error body es privado
      this.body!.setVelocity(0);
      this.body!.enable = false;
    }
    this.anims?.stop();
    this.idle();
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
        this.idle();
        if (!this.scene?.player?.dead) this.canMove = true;
        this.setAlpha(1);
      },
    });
  }

  walk() {
    if (this.anims.currentAnim?.key !== this.walkAnimKey && this.canMove) {
      this.play(this.walkAnimKey!);
    }
  }

  idle() {
    if (this.anims?.currentAnim?.key !== this.idleAnimKey && !this.dead) {
      this.play(this.idleAnimKey!);
    }
  }

  takeDamage(damage: number, damageDuration: number = 100) {
    if (this.takingDamage || this.dead) return;
    this.takingDamage = true;
    this.health -= damage;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
      if (this.baseColor) {
        this.setTint(this.baseColor);
      }
    });
    this.scene.time.delayedCall(damageDuration, () => {
      // this.clearTint();
      // if (this.baseColor) {
      //   this.setTint(this.baseColor);
      // }
      this.takingDamage = false;
    });
    if (this.health <= 0) {
      this.scene.player.addExperience(30);
      this.die();
    }
  }

  die() {
    if (this.dead) return;

    this.dead = true;
    this.body!.enable = false;
    this.canMove = false;
    this.setVelocity(0);
    this.anims.stop();
    this.play(this.deathAnimKey!);
    this.once('animationcomplete', () => {
      if (this.isSpecialEnemy) this.dropCoin();
      this.group.remove(this, true, true); // ya destruye
    });
  }

  attack() {
    this.setVelocity(0);
    if (this.anims.currentAnim?.key !== this.attackAnimKey && this.canMove) {
      this.play(this.attackAnimKey!);
    }

    // Evitar múltiples listeners
    if (!this.hasAttackListener) {
      this.hasAttackListener = true;
    this.on(
      'animationupdate',
      (
        animation: Phaser.Animations.Animation,
        frame: Phaser.Animations.AnimationFrame
      ) => {
        if (
        animation.key === this.attackAnimKey &&
        frame.index === 7 &&
        this.canMove &&
        !this.dead
        ) {
        if (!this.scene.player.takingDamage) {
          this.scene.player.takeDamage(this.damage);
        }
        }
      }
    );
    }
  }

  dropCoin() {
    const coin = new Coin(
      this.scene,
      this.x,
      this.y,
      'coin',
      this.difficulty
    )
    console.log('Coin dropped:', coin);
    // Create the coin animation if it doesn't exist
    
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.dead) return;
    this.update();
    this.anims.update(time, delta);
  }

  update() {
    if (this.canMove && !this.dead) {
      //@ts-expect-error body is private
      const playerWorldPos = this.scene.player.body.position;

      const distance = Phaser.Math.Distance.Between(
        this.body!.position.x,
        this.body!.position.y,
        playerWorldPos.x,
        playerWorldPos.y
      );

      if (distance > 50) {
        this.scene.physics.moveToObject(this, playerWorldPos, this.velocity);
        this.setFlipX(playerWorldPos.x < this.body!.position.x);
        this.walk();
      } else {
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
        this.attack();
      }
    }
  }
}

export default Enemy;
