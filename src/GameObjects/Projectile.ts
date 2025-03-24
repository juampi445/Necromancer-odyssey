import * as Phaser from 'phaser';
import Enemy from './Enemy';

declare module 'phaser' {
  interface Scene {
    projectiles?: Phaser.Physics.Arcade.Group;
  }
}

class Projectile extends Phaser.Physics.Arcade.Sprite {
  speed: number = 80;
  target: Enemy;
  damage: number = 5;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy) {
    super(scene, x, y, 'projectile');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.projectiles?.add(this);

    this.target = target;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.setRotation(angle);

    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    this.setVelocity(velocityX, velocityY);

    if (!this.scene.anims.exists('projectile')) {
        this.scene.anims.create({
          key: 'projectile',
          frames: this.anims.generateFrameNumbers('projectile', { start: 0, end: 13 }),
          frameRate: 10,
          repeat: -1
        });
      }

    this.play('projectile');
  }

  onHitTarget() {
    this.target.takeDamage(this.damage);
    this.destroy();
  }

  preUpdate(time: number, delta: number) {
    this.anims.update(time, delta);
    if (this.target.active) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      this.setRotation(angle);
      const velocityX = Math.cos(angle) * this.speed;
      const velocityY = Math.sin(angle) * this.speed;
      this.setVelocity(velocityX, velocityY);
    }
  }
}

export default Projectile;
