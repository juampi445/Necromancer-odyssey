import * as Phaser from 'phaser';
import Enemy from './Enemy';

declare module 'phaser' {
  interface Scene {
    projectiles?: Phaser.Physics.Arcade.Group;
  }
}

class Projectile extends Phaser.Physics.Arcade.Sprite {
  speed: number = 150;
  target: Enemy;
  damage: number;
  animRange: { start: number; end: number } = { start: 0, end: 0 };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    target: Enemy,
    damage: number,
    animRange: { start: number; end: number }
  ) {
    super(scene, x, y, texture);

    this.target = target;
    this.animRange = animRange;
    this.damage = damage;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.projectiles?.add(this);
    console.log('Projectile created:', this.damage, damage);

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.setRotation(angle);

    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    this.setVelocity(velocityX, velocityY);

    // Crear animación si no existe aún
    if (!this.scene.anims.exists(texture)) {
      this.scene.anims.create({
        key: texture,
        frames: this.anims.generateFrameNumbers(texture, {
          start: this.animRange.start,
          end: this.animRange.end - 1,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.play(texture);

    // Auto-destruir luego de 3 segundos por seguridad
    this.scene.time.delayedCall(3000, () => {
      if (this.active) this.destroy();
    });
  }

  onHitTarget(enemy: Enemy) {
    console.log('Projectile hit target:', enemy.health, this.damage);
    if (enemy) enemy.takeDamage(this.damage);
    this.destroy(true);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Destruir si sale del mundo visible
    const cam = this.scene.cameras.main;
    if (!cam.worldView.contains(this.x, this.y)) {
      this.destroy(true);
    }
  }
}

export default Projectile;
