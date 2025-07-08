import * as Phaser from 'phaser';
// import Projectile from './Projectile'; // Import the new Projectile class
import Skill from './Skill';
import { Comet } from './Skills';
import GameScene from '@/scenes/GameScene';

class Player extends Phaser.Physics.Arcade.Sprite {
  canMove: boolean;
  health: number = 100;
  takingDamage: boolean = false;
  dead: boolean = false;
  isAttacking: boolean = false;
  projectiles?: Phaser.GameObjects.Group;
  skills: Skill[]; // Lista de habilidades
  experience: number = 0; // Experiencia del jugador
  lvl: number = 1; // Nivel del jugador
  collectRange: number = 100; // Rango de recolección de monedas
  collectBody?: Phaser.GameObjects.Arc; // Cuerpo para la recolección de monedas

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    // Añadir el jugador a la escena
    scene.add.existing(this);

    // Habilitar las físicas para el jugador
    scene.physics.add.existing(this);

    // Configuración física
    this.setDepth(1); // Asegurarse de que el jugador esté por encima de otros objetos
    this.setScale(1.5);
    this.setCollideWorldBounds(true); // El jugador no podrá salir de los límites del mundo
    this.canMove = false; // Inicialmente, el jugador no puede moverse
    this.create();
    this.skills = [
      new Comet(scene, this), // Primera habilidad
      // Segunda habilidad
      // Podrías agregar más habilidades aquí
      // new Aura(scene, this) // Habilidad de área de efecto
      // new Venom(scene, this) // Habilidad de área de efecto
    ];
  }

  create() {
    this.body!.setSize(20, 38, true); // Ajustar el tamaño del cuerpo para que coincida con el sprite
    // Crear el círculo de recolección y centrarlo en el jugador
    this.createCollectBody();

    // Crear animaciones si no existen ya
    if (!this.scene.anims.exists('idle')) {
      this.scene.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: (this.scene as GameScene).isTouchDevice ? 49 : 10 }),
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

  addExperience(amount: number) {
    this.experience += amount; // Aumentar la experiencia del jugador
    if (this.experience >= (100 * Math.ceil(Math.pow(1.5, this.lvl - 1)))) {
      console.log('Nivel alcanzado! Experiencia actual:', this.experience);
      this.experience = 0; // Reiniciar experiencia al alcanzar 100
      this.levelUp(); // Llamar a la función de nivelación
    }
    this.scene.game.events.emit('update-experience', this.experience, this.lvl); // Emitir un evento para actualizar la experiencia
  }

  levelUp() {
    console.log('Nivel aumentado! Salud actual:', this.health);
    this.lvl += 1; // Aumentar el nivel del jugador
    // this.skills.forEach(skill => {
    //   skill.quantity += 1; // Aumentar la cantidad de proyectiles de cada habilidad
    //   skill.damage += 5; // Aumentar el daño de cada habilidad
    // });
    this.scene.game.events.emit('update-health', 100); // Emitir un evento de nivelación
    this.scene.events.emit('level-up', this.lvl); // Emitir un evento de nivelación
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

  createCollectBody() {
    // this.collectBody = this.scene.add.circle(this.x, this.y, this.collectRange, 0xfff000, 0.2);
    this.collectBody = this.scene.add.circle(this.x, this.y, this.collectRange, 0x000000, 0);
    this.collectBody.setDepth(0);
    this.scene.physics.add.existing(this.collectBody, false);
    const collectBodyPhysics = this.collectBody.body as Phaser.Physics.Arcade.Body;
    collectBodyPhysics.setAllowGravity(false);
    collectBodyPhysics.setCircle(this.collectRange);
    // collectBodyPhysics.setOffset(
    //   -this.collectRange + this.body!.width / 2,
    //   -this.collectRange + this.body!.height / 2
    // );
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

  moveWithJoystick(joystickValue: { x: number, y: number }) {
    if (!this.canMove || this.dead) return;

    const magnitude = Math.sqrt(joystickValue.x ** 2 + joystickValue.y ** 2);
    if (magnitude < 10) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
      this.idle();
      return;
    }

    const normalizedX = joystickValue.x / magnitude;
    const normalizedY = joystickValue.y / magnitude;

    const speed = 120;

    this.setVelocity(normalizedX * speed, normalizedY * speed);

    if (normalizedX < 0) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    this.walk();
  }


  update() {
    if (this.canMove) {
      // Lógica de movimiento
      if (this.canMove && !this.scene.input.pointer1.isDown) {
        this.move(); // fallback to mouse movement only if no touch input
      }
    }

    if (this.health <= 0 && !this.dead) {
      this.dead = true;
      this.death();
    }

    if (this.collectBody) {
      this.collectBody.setPosition(this.x, this.y);
    }
  }
}

export default Player;
