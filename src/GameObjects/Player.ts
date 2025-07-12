import * as Phaser from 'phaser';
import Skill from './Skill';
import { Comet } from './Skills';
import GameScene from '@/scenes/GameScene';
import { GlobalDataSingleton } from '@/data/GlobalDataSingleton';

class Player extends Phaser.Physics.Arcade.Sprite {
  canMove: boolean;
  health: number = 100;
  baseHealth: number = 100;
  baseSpeed: number = 120;
  baseDamage: number = 10;
  takingDamage: boolean = false;
  dead: boolean = false;
  isAttacking: boolean = false;
  projectiles?: Phaser.GameObjects.Group;
  skills: Skill[];
  experience: number = 0;
  lvl: number = 1;
  collectRange: number = 100;
  collectBody?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(1);
    this.setScale(1.5);
    this.setCollideWorldBounds(true);
    this.canMove = false;

    // Apply stats from GlobalData
    const globalData = GlobalDataSingleton.instance;
    // const stats = globalData.items;

    this.baseHealth = globalData.calculateStats().health;
    this.baseSpeed = globalData.calculateStats().speed;
    this.baseDamage = globalData.calculateStats().damage;

    console.log('Player stats:', {
      health: this.baseHealth,
      speed: this.baseSpeed,
      damage: this.baseDamage,
    });

    this.create();
    this.skills = [
      new Comet(scene, this),
    ];
  }

  create() {
    this.body!.setSize(20, 38, true);
    this.createCollectBody();

    if (!this.scene.anims.exists('idle')) {
      this.scene.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 49 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists('walk')) {
      this.scene.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('walk', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists('spawn')) {
      this.scene.anims.create({
        key: 'spawn',
        frames: this.anims.generateFrameNumbers('spawn', { start: 0, end: 19 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    if (!this.scene.anims.exists('death')) {
      this.scene.anims.create({
        key: 'death',
        frames: this.anims.generateFrameNumbers('death', { start: 0, end: 51 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    this.spawn();
  }

  walk() {
    if (this.anims.currentAnim?.key !== 'walk' && this.canMove) {
      this.play('walk');
    }
  }

  idle() {
    if (this.anims.currentAnim?.key !== 'idle' && this.canMove && !this.dead) {
      this.play('idle');
    }
  }

  spawn() {
    this.canMove = false;
    this.play('spawn').on('animationcomplete', () => {
      this.canMove = true;
      this.idle();
      this.isAttacking = true;
    });
  }

  addExperience(amount: number) {
    this.experience += amount;
    if (this.experience >= 100 * Math.ceil(Math.pow(1.5, this.lvl - 1))) {
      this.experience = 0;
      this.levelUp();
    }
    this.scene.game.events.emit('update-experience', this.experience, this.lvl);
  }

  levelUp() {
    this.lvl += 1;
    // RESET HEALTH
    // this.scene.game.events.emit('update-health', this.baseHealth);
    this.scene.events.emit('level-up', this.lvl);
  }

  takeDamage(damage: number) {
    this.takingDamage = true;
    this.setTint(0xff0000);
    this.health -= damage;
    this.scene.game.events.emit('update-health', this.health);
    setTimeout(() => {
      this.clearTint();
      this.takingDamage = false;
    }, 300);
  }

  death() {
    this.canMove = false;
    this.dead = true;
    this.setTint(0x000000);
    this.setVelocity(0);
    this.play('death').on('animationcomplete', () => {
      this.scene.game.events.emit('game-over-modal');
    });
    this.scene.game.events.emit('game-over');
  }

  createCollectBody() {
    this.collectBody = this.scene.add.circle(this.x, this.y, this.collectRange, 0x000000, 0);
    this.collectBody.setDepth(0);
    this.scene.physics.add.existing(this.collectBody, false);
    const collectBodyPhysics = this.collectBody.body as Phaser.Physics.Arcade.Body;
    collectBodyPhysics.setAllowGravity(false);
    collectBodyPhysics.setCircle(this.collectRange);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.update();
    this.skills.forEach(skill => skill.update());
  }

  move() {
    if ((this.scene as GameScene).isTouchDevice) return;

    const pointer = this.scene.input.activePointer;
    const pointerWorldPos = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const distance = Phaser.Math.Distance.Between(this.x, this.y, pointerWorldPos.x, pointerWorldPos.y);

    if (distance > 100 && !this.dead) {
      this.scene.physics.moveToObject(this, pointerWorldPos, this.baseSpeed);
      this.setFlipX(pointerWorldPos.x < this.x);
      this.walk();
    } else {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
      this.idle();
    }
  }

  moveWithJoystick(joystickValue: { x: number; y: number }) {
    if (!this.canMove || this.dead) return;

    const magnitude = Math.sqrt(joystickValue.x ** 2 + joystickValue.y ** 2);
    if (magnitude < 10) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
      this.idle();
      return;
    }

    const normalizedX = joystickValue.x / magnitude;
    const normalizedY = joystickValue.y / magnitude;

    this.setVelocity(normalizedX * this.baseSpeed, normalizedY * this.baseSpeed);
    this.setFlipX(normalizedX < 0);
    this.walk();
  }

  update() {
    if (this.canMove && !this.scene.input.pointer1.isDown) {
      this.move();
    }

    if (this.health <= 0 && !this.dead) {
      this.death();
    }

    if (this.collectBody) {
      this.collectBody.setPosition(this.x, this.y);
    }
  }
}

export default Player;
