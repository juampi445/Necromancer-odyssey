import * as Phaser from 'phaser';
import Projectile from './Projectile'; // Import the new Projectile class

class Player extends Phaser.Physics.Arcade.Sprite {
  canMove: boolean;
  health: number = 100;
  takingDamage: boolean = false;
  dead: boolean = false;
  isAttacking: boolean = false;
  projectiles?: Phaser.GameObjects.Group;

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

    if (!this.scene.anims.exists('death')) {
      this.scene.anims.create({
        key: 'death',
        frames: this.anims.generateFrameNumbers('death', { start: 0, end: 51 }),
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
    if (this.anims.currentAnim?.key !== 'idle' && this.canMove && !this.dead) {
      this.play('idle'); // Reproducir solo si el jugador puede moverse
    }
  }

  spawn() {
    this.canMove = false; // Bloquear movimiento durante la animación de spawn
    this.play('spawn').on('animationcomplete', () => {
      this.canMove = true; // Permitir movimiento al terminar la animación de spawn
      this.idle(); // Cambiar a la animación idle
      this.isAttacking = true;
    });
  }

  takeDamage(damage: number) {
    this.takingDamage = true; // Marcar al jugador como recibiendo daño
    this.setTint(0xff0000); // Cambiar el color del jugador a rojo
    this.health -= damage; // Reducir la salud del jugador
    this.scene.game.events.emit('update-health', this.health); // Emitir un evento para actualizar la barra de salud
    setTimeout(() => {
      this.clearTint(); // Restaurar el color original del jugador
      this.takingDamage = false; // Marcar al jugador como no recibiendo daño
    }, 300); // Restaurar el color después de 300ms
  }

  death() {
    this.canMove = false; // Bloquear movimiento
    this.dead = true; // Marcar al jugador como muerto
    this.setTint(0x000000); // Cambiar el color del jugador a negro
    this.setVelocity(0); // Detener el movimiento
    this.play('death').on('animationcomplete', () => {
      this.scene.game.events.emit('game-over-modal');
    });
    this.scene.game.events.emit('game-over'); // Emitir un evento para indicar que el jugador ha perdido
  }

  preUpdate(time: number, delta: number) {
    this.update();
    this.anims.update(time, delta);
  }

  attack() {
    if (!this.scene) {
      console.error('La escena no está disponible para el jugador');
      return;
    }
    if (this.dead) return; // No atacar si el jugador está muerto
    // Obtener los enemigos más cercanos
    // @ts-expect-error: skeletonGroup is not typed but is expected to exist in the scene
    const enemies = this.scene.skeletonGroup.getChildren().filter((enemy: Phaser.Physics.Arcade.Sprite) => {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      return distance <= 300;
    });

    if (enemies.length === 0) return;

    // Seleccionar el enemigo más cercano
    const nearestEnemy = enemies.reduce((nearest: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) => {
      const distanceToCurrentEnemy = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      const distanceToNearestEnemy = Phaser.Math.Distance.Between(this.x, this.y, nearest.x, nearest.y);
      return distanceToCurrentEnemy < distanceToNearestEnemy ? enemy : nearest;
    });

    // Crear un nuevo proyectil y apuntarlo al enemigo más cercano
    const projectile = new Projectile(this.scene, this.x, this.y, nearestEnemy);

    // Añadir el proyectil a un grupo
    if (!this.projectiles) {
      this.projectiles = this.scene.add.group();
    }
    this.projectiles.add(projectile);

    console.log('Atacando al enemigo más cercano');
  }

  move() {
      const pointer = this.scene.input.activePointer;
      const pointerWorldPos = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
  
      const distance = Phaser.Math.Distance.Between(this.x, this.y, pointerWorldPos.x, pointerWorldPos.y);
      if (distance > 100 && !this.dead) {
        this.scene.physics.moveToObject(this, pointerWorldPos, 120);
        if (pointerWorldPos.x < this.x) {
          this.setFlipX(true);
        } else {
          this.setFlipX(false);
        }
        this.walk();
      } else {
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
        this.idle();
      }
  }

  update() {
    if (this.canMove) {
      // Lógica de movimiento
      this.move()
    }

    if (this.health <= 0 && !this.dead) {
      this.dead = true;
      this.death();
    }

    if (this.isAttacking) {
      this.isAttacking = false;
      setTimeout(() => {
        this.attack();
        this.isAttacking = true;
      }, 2000);
    }
  }
}

export default Player;
