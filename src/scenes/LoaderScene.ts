import * as Phaser from 'phaser';

class LoaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoaderScene' });
  }

  preload() {
    // Mostrar texto de "Cargando..."
    const loadingText = this.add.text(window.innerWidth / 2, window.innerHeight / 2, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    // Barra de progreso
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(window.innerWidth / 4, window.innerHeight / 2 - 30, window.innerWidth / 2, 50);

    // Evento de progreso para actualizar la barra
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(window.innerWidth / 4 + 10, window.innerHeight / 2 - 20, (window.innerWidth / 2 - 20) * value, 30);
    });

    // Cuando la carga esté completa, destruye la barra
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Cargar todos los assets del juego aquí
    this.load.image('brick_1', '/assets/brickwall_.jpg');
    this.load.image('brick_2', '/assets/brickwall_2.jpg');

    this.load.spritesheet('player', '/assets/Necromancer/Idle/spr_NecromancerIdle_strip50.png', { frameWidth: 4800/50, frameHeight: 96 });
    this.load.spritesheet('walk', '/assets/Necromancer/Walk/spr_NecromancerWalk_strip10.png', { frameWidth: 960/10, frameHeight: 96 });  
    this.load.spritesheet('spawn', '/assets/Necromancer/Spawn/spr_NecromancerSpawn_strip20.png', { frameWidth: 2560/20, frameHeight: 128 });  
    
    this.load.spritesheet('skeleton', '/assets/Skeletons_Free_Pack/Skeleton_Sword/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Idle.png', { frameWidth: 768/8, frameHeight: 64 });
    this.load.spritesheet('skeletonwalk', '/assets/Skeletons_Free_Pack/Skeleton_Sword/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Walk.png', { frameWidth: 960/10, frameHeight: 64 });  
    this.load.spritesheet('skeleton-attack', '/assets/Skeletons_Free_Pack/Skeleton_Sword/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Attack1.png', { frameWidth: 960/10, frameHeight: 64 });
  }

  create() {
    // Cuando se haya cargado, pasar a la siguiente escena
    this.scene.start('GameScene');
  }
}

export default LoaderScene;
