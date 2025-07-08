import * as Phaser from 'phaser';
import Player from '../GameObjects/Player';
// import Skeleton from '@/GameObjects/Skeleton';
import Projectile from '@/GameObjects/Projectile';
import { SkillsManager } from '@/GameObjects/SkillsManager';
import { Aura, Comet, Lightning, Venom } from '@/GameObjects/Skills';
import Goblin from '@/GameObjects/Goblin';
import Skeleton from '@/GameObjects/Skeleton';
import Eye from '@/GameObjects/Eye';
import GreenSkeleton from '@/GameObjects/GreenSkeleton';
import Mushroom from '@/GameObjects/Mushroom';
import Enemy from '@/GameObjects/Enemy';
import Coin from '@/GameObjects/Coin';
// import GreenSkeleton from '@/GameObjects/GreenSkeleton';

export class GameScene extends Phaser.Scene {
  player!: Player;
  enemiesGroup: Phaser.Physics.Arcade.Group | undefined;
  projectiles: Phaser.Physics.Arcade.Group | undefined;
  areaOfEffect: Phaser.Physics.Arcade.Group | undefined;
  coins: Phaser.Physics.Arcade.Group | undefined;
  canWin: boolean = true;
  spawnTimer?: Phaser.Time.TimerEvent;
  skillsManager: SkillsManager | undefined;
  enemiesByLevel: { [key: number]: Array<typeof Enemy> } = {};
  difficultyByLvl: number = 4;
  enemiesSpawnedCount: number = 0;
  specialEnemyThreshold: number = 10;
  totalCoins: number = 0;
  isTouchDevice: boolean = false;
  joystickBg?: Phaser.GameObjects.Image;
  joystickThumb?: Phaser.GameObjects.Image;
  joystickPointerId?: number;
  joystickValue = { x: 0, y: 0 };


  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.physics.world.setBounds(0, 0, window.innerWidth * 4, window.innerHeight * 4);
    this.createBg();
    this.player = new Player(this, this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2, 'player');
    this.createSkillsManager();
    this.enemiesGroup = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.areaOfEffect = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.enemiesGroup.runChildUpdate = true;
    this.enemiesByLevel = {
      1: [Skeleton],
      2: [Skeleton],
      3: [Skeleton],
      4: [Skeleton, Eye],
      5: [Skeleton, Eye],
      6: [Skeleton, Eye],
      7: [Eye, Goblin],
      8: [Eye, Goblin],
      9: [Eye, Goblin],
      10: [Eye, Goblin, GreenSkeleton],
      11: [Eye, Goblin, GreenSkeleton],
      12: [Eye, Goblin, GreenSkeleton],
      13: [GreenSkeleton, Mushroom],
      14: [GreenSkeleton, Mushroom],
      15: [GreenSkeleton, Mushroom, Goblin]
    };

    this.spawnTimer = this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
          this.spawnEnemies()
      }
    });
    this.events.on('level-up', () => {
      // const minDelay = 500;
      // const maxDelay = 3000;
      // const lvl = Math.min(this.player.lvl, 15);
      // const newDelay = maxDelay - ((maxDelay - minDelay) * (lvl - 1) / (15 - 1));
      const newDelay = 3000;
      if (this.spawnTimer) {
        this.spawnTimer.remove(false);
      }
      this.spawnTimer = this.time.addEvent({
        delay: newDelay,
        loop: true,
        callback: () => {
          this.spawnEnemies()
        }
      });
      console.log(`Spawn delay updated to ${newDelay}ms for level ${this.player.lvl}`);
    });
    this.cameras.main.startFollow(this.player, false, 0.5, 0.5);
    this.setupColliders();
    this.createJoystick();

    this.game.events.on('game-over', () => {
      this.spawnTimer?.remove(false);
      this.killEnemies();
    });
  }

  createBg() {
    const bounds = this.physics.world.bounds;
    const tileWidth = !this.isTouchDevice ? window.innerWidth / 16 : window.innerWidth / 32;
    this.createTileGrid(bounds.width, bounds.height, tileWidth, 'brick_2');
    const mask = this.add.graphics();
    mask.fillStyle(0x7b7554, 0.6);
    mask.fillRect(
        -window.innerWidth,
        -window.innerHeight,
        bounds.width + window.innerWidth * 2,
        bounds.height + window.innerHeight * 2
      );
  }

  createTileGrid(width: number, height: number, tileWidth: number, texture: string) {
    for (let x = 0; x < width; x += tileWidth) {
      for (let y = 0; y < height; y += tileWidth) {
        const image = this.add.image(x, y, texture).setOrigin(0, 0);
        image.displayWidth = tileWidth;
        image.displayHeight = tileWidth;
      }
    }
  }

  createSkillsManager() {
    this.skillsManager = new SkillsManager({
      scene: this,
      skills: [
        new Comet(this, this.player),
        // new Comet2(this, this.player),
        new Aura(this, this.player),
        new Venom(this, this.player),
        new Lightning(this, this.player)
      ]
    });
  }

  spawnEnemies() {
    const cam = this.cameras.main;
    const margin = 100;

    const viewLeft = cam.worldView.left;
    const viewRight = cam.worldView.right;
    const viewTop = cam.worldView.top;
    const viewBottom = cam.worldView.bottom;
    
    const currentDifficulty = this.player.lvl * this.difficultyByLvl;
    const enemiesToSpawn = this.enemiesByLevel[this.player.lvl] || [Skeleton];
    let difficultyCount = 0;

    while (difficultyCount < currentDifficulty) {
      const enemyClass: typeof Enemy = enemiesToSpawn[Phaser.Math.Between(0, enemiesToSpawn.length - 1)];
      const side = Phaser.Math.Between(0, 3);
      let x = 0, y = 0;
      console.log(`Spawning enemy of type ${enemyClass.prototype.difficulty} on side ${side} with difficulty count ${difficultyCount}, current difficulty ${currentDifficulty}`);
      if (side === 0) { // top
        x = Phaser.Math.Between(viewLeft, viewRight);
        y = viewTop - margin;
      } else if (side === 1) { // bottom
        x = Phaser.Math.Between(viewLeft, viewRight);
        y = viewBottom + margin;
      } else if (side === 2) { // left
        x = viewLeft - margin;
        y = Phaser.Math.Between(viewTop, viewBottom);
      } else { // right
        x = viewRight + margin;
        y = Phaser.Math.Between(viewTop, viewBottom);
      }

      const isSpecialEnemy = this.enemiesSpawnedCount >= this.specialEnemyThreshold;
      console.log(`Spawning aa44(${this.enemiesSpawnedCount}, ${y}) with isSpecialEnemy: ${isSpecialEnemy}`);
      const newEnemy = new enemyClass(this, x, y, undefined, this.enemiesGroup!, isSpecialEnemy);
      difficultyCount += newEnemy.difficulty || 1;
      if (isSpecialEnemy) {
        this.enemiesSpawnedCount = 0;
      } else this.enemiesSpawnedCount++;
    }
  }


  killEnemies() {
    if (this.enemiesGroup) {
      this.enemiesGroup.getChildren().forEach((enemy) => {
        const enemyObj = enemy as Enemy;
        enemyObj.die();
        console.log('Enemy defeated:', enemyObj);
      });
    }
  }

createJoystick() {
  this.joystickBg = this.add.image(100, 100, 'joystick-bg')
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false)
    .setDepth(100);

  this.joystickThumb = this.add.image(100, 100, 'joystick-thumb')
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setVisible(false)
    .setDepth(101);

  this.input.on('pointerdown', this.onJoystickPointerDown, this);
  this.input.on('pointerup', this.onJoystickPointerUp, this);
  this.input.on('pointermove', this.onJoystickPointerMove, this);
}


onJoystickPointerDown(pointer: Phaser.Input.Pointer) {
  if (pointer.x < window.innerWidth / 2 && this.joystickPointerId == null) {
    this.joystickPointerId = pointer.id;

    this.joystickBg!.setPosition(pointer.x, pointer.y).setVisible(true);
    this.joystickThumb!.setPosition(pointer.x, pointer.y).setVisible(true);
  }
}


onJoystickPointerUp(pointer: Phaser.Input.Pointer) {
  if (pointer.id === this.joystickPointerId) {
    this.joystickValue = { x: 0, y: 0 };
    this.joystickThumb!.setPosition(this.joystickBg!.x, this.joystickBg!.y);
    this.joystickPointerId = undefined;

    this.joystickBg?.setVisible(false);
    this.joystickThumb?.setVisible(false);

    this.player.idle();
  }
}


  onJoystickPointerMove(pointer: Phaser.Input.Pointer) {
    if (pointer.id === this.joystickPointerId) {
      const dx = pointer.x - this.joystickBg!.x;
      const dy = pointer.y - this.joystickBg!.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = this.joystickBg!.displayWidth / 2;

      if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        this.joystickValue.x = Math.cos(angle) * maxDistance;
        this.joystickValue.y = Math.sin(angle) * maxDistance;
      } else {
        this.joystickValue.x = dx;
        this.joystickValue.y = dy;
      }

      this.joystickThumb!.setPosition(
        this.joystickBg!.x + this.joystickValue.x,
        this.joystickBg!.y + this.joystickValue.y
      );

      if (this.player.canMove) {
        this.player.moveWithJoystick(this.joystickValue);
      }
    }
  }

  setupColliders() {
    if (this.enemiesGroup) {
      this.enemiesGroup.runChildUpdate = true;
      this.physics.add.collider(this.enemiesGroup, this.enemiesGroup, () => {});
      this.physics.add.overlap(this.enemiesGroup, this.areaOfEffect!, (enemy, area) => {
        // console.log('Enemy hit by area effect:', enemy, area);
        const enemyObj = enemy as Enemy;
        const areaObj = area as Projectile;
        if (areaObj.areaEffect) areaObj.areaEffect(enemyObj);
      });
    }
    this.physics.add.collider(this.player, this.enemiesGroup!, () => {});
    this.physics.add.collider(this.projectiles!, this.enemiesGroup!, (projectile, enemy) => {
      console.log('hit', projectile, enemy);
      const proj = projectile as Projectile;
      const enemyObj = enemy as Enemy;
      console.log('Projectile hit enemy:', proj, enemyObj);
      proj.onHitTarget(enemyObj, this);
    });
    if (this.player.collectBody) {
      this.physics.add.overlap(this.player.collectBody, this.coins!, (playerCollectBody, coin) => {
        // const playerCollectBody = player as Player;
        const coinObj = coin as Coin;
        coinObj.collect(this.player, this);
      });
    }
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    if (this.canWin && this.enemiesGroup ) {
      if (this.player.lvl >= 15) {
        this.spawnTimer?.remove(false);
        this.killEnemies();
        this.canWin = false; // Reset canWin to prevent multiple win events
        this.game.events.emit('game-win');
        this.player.idle();
        this.player.canMove = false;
        this.player.setVelocity(0);
        console.log('ganaste');
      }
    }
    // if () {
    //   this.game.events.emit('game-win');
    // }
  }
}

export default GameScene;
