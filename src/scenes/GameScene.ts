import * as Phaser from 'phaser';
import Player from '../GameObjects/Player';
import Skeleton from '@/GameObjects/Skeleton';
import Projectile from '@/GameObjects/Projectile';
import Enemy from '@/GameObjects/Enemy';
import { SkillsManager } from '@/GameObjects/SkillsManager';
import { Aura, Comet, Comet2, Venom } from '@/GameObjects/Skills';

export class GameScene extends Phaser.Scene {
  player!: Player;
  enemiesGroup: Phaser.Physics.Arcade.Group | undefined;
  projectiles: Phaser.Physics.Arcade.Group | undefined;
  areaOfEffect: Phaser.Physics.Arcade.Group | undefined;
  canWin: boolean = true; // Variable para controlar si se puede ganar
  spawnTimer?: Phaser.Time.TimerEvent;
  skillsManager: SkillsManager | undefined; // Cambia esto al tipo correcto de tu SkillsManager

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
    this.enemiesGroup.runChildUpdate = true;
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
    this.physics.add.overlap(this.enemiesGroup, this.areaOfEffect!, (enemy, area) => {
      // console.log('Enemy hit by area effect:', enemy, area);
      const enemyObj = enemy as Enemy;
      const areaObj = area as Projectile;
      if (areaObj.areaEffect) areaObj.areaEffect(enemyObj);
    });

    this.spawnTimer = this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        // const x = Phaser.Math.Between(
        //   this.player.x - window.innerWidth / 2,
        //   this.player.x + window.innerWidth / 2
        // );
        // const y = Phaser.Math.Between(
        //   this.player.y - window.innerHeight / 2,
        //   this.player.y + window.innerHeight / 2
        // );

        // new Skeleton(this, x, y, 'skeleton', this.enemiesGroup!);
          this.spawnEnemies()

      }
    });
    this.events.on('level-up', () => {
      const minDelay = 500;
      const maxDelay = 3000;
      const lvl = Math.min(this.player.lvl, 15);
      const newDelay = maxDelay - ((maxDelay - minDelay) * (lvl - 1) / (15 - 1));
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

    this.game.events.on('game-over', () => {
      this.spawnTimer?.remove(false);
      this.killEnemies();
    });
  }

  createBg() {
    const bounds = this.physics.world.bounds;
    this.createTileGrid(bounds.width, bounds.height, window.innerWidth / 16, 'brick_2');
    const mask = this.add.graphics();
    mask.fillStyle(0x7b7554, 0.6); // Color crema con 50% de transparencia
    mask.fillRect(
        -window.innerWidth,  // Extender la máscara a la izquierda
        -window.innerHeight, // Extender la máscara hacia arriba
        bounds.width + window.innerWidth * 2,  // Aumentar el ancho de la máscara
        bounds.height + window.innerHeight * 2 // Aumentar la altura de la máscara
      );
      
  }

  createTileGrid(width: number, height: number, tileWidth: number, texture: string) {
    for (let x = 0; x < width; x += tileWidth) {
      for (let y = 0; y < height; y += tileWidth) {
        const image = this.add.image(x, y, texture).setOrigin(0, 0);
        image.displayWidth = tileWidth;
        image.displayHeight = tileWidth; // Mantener la relación de aspecto
      }
    }
  }

  createSkillsManager() {
    this.skillsManager = new SkillsManager({
      scene: this,
      skills: [
        new Comet(this, this.player),
        new Comet2(this, this.player),
        new Aura(this, this.player),
        new Venom(this, this.player)
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

    for (let i = 0; i < this.player.lvl; i++) {
      const side = Phaser.Math.Between(0, 3);
      let x = 0, y = 0;

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

      new Skeleton(this, x, y, 'skeleton', this.enemiesGroup!);
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

  setupColliders() {
    if (this.enemiesGroup) {
      this.enemiesGroup.runChildUpdate = true;
      this.physics.add.collider(this.enemiesGroup, this.enemiesGroup, () => {});
    }
    this.physics.add.collider(this.player, this.enemiesGroup!, () => {});
    this.physics.add.collider(this.projectiles!, this.enemiesGroup!, (projectile, enemy) => {
      console.log('hit', projectile, enemy);
      const proj = projectile as Projectile;
      const enemyObj = enemy as Enemy;
      console.log('Projectile hit enemy:', proj, enemyObj);
      proj.onHitTarget(enemyObj, this);
    });
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
