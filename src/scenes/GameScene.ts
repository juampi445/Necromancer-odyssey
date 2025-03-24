import * as Phaser from 'phaser';
import Player from '../GameObjects/Player';
import Skeleton from '@/GameObjects/Skeleton';
import Projectile from '@/GameObjects/Projectile';

class GameScene extends Phaser.Scene {
  private player!: Player;
  skeletonGroup: Phaser.Physics.Arcade.Group | undefined;
  projectiles: Phaser.Physics.Arcade.Group | undefined;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.physics.world.setBounds(0, 0, window.innerWidth * 4, window.innerHeight * 4);
    this.createBg();
    this.player = new Player(this, this.physics.world.bounds.width/2, this.physics.world.bounds.height/2, 'player');
    this.skeletonGroup = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    new Skeleton(this, this.physics.world.bounds.width/2 + 100, this.physics.world.bounds.height/2 + 100, 'skeleton', this.skeletonGroup);
    new Skeleton(this, this.physics.world.bounds.width/2 + 200, this.physics.world.bounds.height/2 + 100, 'skeleton', this.skeletonGroup);
    this.skeletonGroup.runChildUpdate = true;
    this.physics.add.collider(this.skeletonGroup, this.skeletonGroup);
    //disable rules for skeletons
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    
    new Array(10).fill(0).forEach(() => {
      const x = Phaser.Math.Between(
        this.player.x - window.innerWidth / 2,
        this.player.x + window.innerWidth / 2
      );
      const y = Phaser.Math.Between(
        this.player.y - window.innerHeight / 2,
        this.player.y + window.innerHeight / 2
      );
  
      new Skeleton(this, x, y, 'skeleton', this.skeletonGroup!);
    });
    this.cameras.main.startFollow(this.player, false, 0.5, 0.5);
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

  setupColliders() {
    if (this.skeletonGroup) {
      this.skeletonGroup.runChildUpdate = true;
      this.physics.add.collider(this.skeletonGroup, this.skeletonGroup, () => {});
    }
    this.physics.add.collider(this.player, this.skeletonGroup!, () => {});
    this.physics.add.collider(this.projectiles!, this.skeletonGroup!, (projectile) => {
      const proj = projectile as Projectile;
      proj.onHitTarget();
    });
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.setupColliders();
  }
}

export default GameScene;
