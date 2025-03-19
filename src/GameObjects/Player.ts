import * as Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  canMove: boolean;
  health: number = 100;
  takingDamage: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    // Añadir el jugador a la escena
    scene.add.existing(this);

    // Habilitar las físicas para el jugador
    scene.physics.add.existing(this);

    // Configuración física
    this.setScale(1.5);
    this.setCollideWorldBounds(true); // El jugador no podrá salir de los límites del mundo
    this.canMove = false; // Inicialmente, el jugador no puede moverse
    this.create();
  }

  create() {
    this.body!.setSize(20, 38, true); // Ajustar el tamaño del cuerpo para que coincida con el sprite

    // Crear animaciones si no existen ya
    if (!this.scene.anims.exists('idle')) {
      this.scene.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 49 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('walk')) {
      this.scene.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('walk', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('spawn')) {
      this.scene.anims.create({
        key: 'spawn',
        frames: this.anims.generateFrameNumbers('spawn', { start: 0, end: 19 }),
        frameRate: 10,
        repeat: 0
      });
    }

    // Reproducir animación de spawn inicialmente
    this.spawn();
  }

  walk() {
    if (this.anims.currentAnim?.key !== 'walk' && this.canMove) {
      this.play('walk'); // Reproducir solo si el jugador puede moverse
    }
  }

  idle() {
    if (this.anims.currentAnim?.key !== 'idle' && this.canMove) {
      this.play('idle'); // Reproducir solo si el jugador puede moverse
    }
  }

  spawn() {
    this.canMove = false; // Bloquear movimiento durante la animación de spawn
    this.play('spawn').on('animationcomplete', () => {
      this.canMove = true; // Permitir movimiento al terminar la animación de spawn
      this.idle(); // Cambiar a la animación idle
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  takeDamage(damage: number) {
    this.takingDamage = true; // Marcar al jugador como recibiendo daño
    this.setTint(0xff0000); // Cambiar el color del jugador a rojo
    this.health -= damage; // Reducir la salud del jugador
    this.scene.game.events.emit('update-health', this.health); // Emitir un evento para actualizar la barra de salud
    setTimeout(() => {
      this.clearTint(); // Restaurar el color original del jugador
      this.takingDamage = false; // Marcar al jugador como no recibiendo daño
    }, 300); // Restaurar el color después de 100ms
    // Aquí puedes añadir la lógica de recibir daño
  } 

  update() {
    // Aquí puedes añadir la lógica de movimiento del jugador si se permite moverse
    if (this.canMove) {
      // Lógica de movimiento del jugador
    }
    if (this.health <= 0) {
      this.scene.game.events.emit('game-over'); // Emitir un evento para indicar que el jugador ha perdido
    }
  }
}

export default Player;
