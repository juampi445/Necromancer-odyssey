import * as Phaser from 'phaser';
import Player from '../GameObjects/Player';
import Skeleton from '@/GameObjects/Skeleton';

class GameScene extends Phaser.Scene {
  private player!: Player;
  skeletonGroup: Phaser.Physics.Arcade.Group | undefined;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.physics.world.setBounds(0, 0, window.innerWidth * 4, window.innerHeight * 4);
    this.createBg();
    this.skeletonGroup = this.physics.add.group();
    this.player = new Player(this, this.physics.world.bounds.width/2, this.physics.world.bounds.height/2, 'player');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testSkeleton = new Skeleton(this, this.physics.world.bounds.width/2 + 100, this.physics.world.bounds.height/2 + 100, 'skeleton', this.skeletonGroup);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(time: number, delta: number) {
    if (this.player.canMove) {
      const pointer = this.input.activePointer;
      const pointerWorldPos = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
  
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, pointerWorldPos.x, pointerWorldPos.y);
      if (distance > 100) {
        this.physics.moveToObject(this.player, pointerWorldPos, 120);
        if (pointerWorldPos.x < this.player.x) {
          this.player.setFlipX(true);
        } else {
          this.player.setFlipX(false);
        }
        this.player.walk();
      } else {
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
        this.player.idle();
      }
    }
  }
}

export default GameScene;
