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

    //MAP
    this.load.image('brick_1', '/assets/brickwall_.jpg');
    this.load.image('brick_2', '/assets/brickwall_2.jpg');

    //PLAYER
    // this.load.spritesheet('player', '/assets/Necromancer/Idle/spr_NecromancerIdle_strip50.png', { frameWidth: 4800/50, frameHeight: 96 });
    this.load.spritesheet('player', '/assets/Necromancer/Idle/prueba.png', { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('walk', '/assets/Necromancer/Walk/spr_NecromancerWalk_strip10.png', { frameWidth: 960/10, frameHeight: 96 });  
    this.load.spritesheet('spawn', '/assets/Necromancer/Spawn/spr_NecromancerSpawn_strip20.png', { frameWidth: 2560/20, frameHeight: 128 });  
    this.load.spritesheet('death', '/assets/Necromancer/Death/spr_NecromancerDeath_strip52.png', { frameWidth: 4992/52, frameHeight: 96 });  

    //ENEMIES
    this.load.spritesheet('skeleton', '/assets/Skeletons_Free_Pack/Skeleton_Sword/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Idle.png', { frameWidth: 768/8, frameHeight: 64 });
    this.load.spritesheet('skeleton-walk', '/assets/Skeletons_Free_Pack/Skeleton_Sword/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Walk.png', { frameWidth: 960/10, frameHeight: 64 });  
    this.load.spritesheet('skeleton-attack', '/assets/Skeletons_Free_Pack/Skeleton_Sword/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Attack1.png', { frameWidth: 960/10, frameHeight: 64 });
    this.load.spritesheet('skeleton-death', '/assets/Skeletons_Free_Pack/Skeleton_Sword/Skeleton_White/Skeleton_With_VFX/Skeleton_01_White_Die.png', { frameWidth: 1248/13, frameHeight: 64 });
  
    this.load.spritesheet('green-skeleton', '/assets/enemies/GreenSkeleton/Idle.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('green-skeleton-walk', '/assets/enemies/GreenSkeleton/Walk.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('green-skeleton-attack', '/assets/enemies/GreenSkeleton/Attack.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('green-skeleton-death', '/assets/enemies/GreenSkeleton/Death.png', { frameWidth: 150, frameHeight: 150 });

    this.load.spritesheet('eye', '/assets/enemies/FlyingEye/Flight.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('eye-walk', '/assets/enemies/FlyingEye/Flight.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('eye-attack', '/assets/enemies/FlyingEye/Attack.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('eye-death', '/assets/enemies/FlyingEye/Death.png', { frameWidth: 150, frameHeight: 150 });

    this.load.spritesheet('goblin', '/assets/enemies/Goblin/Idle.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('goblin-walk', '/assets/enemies/Goblin/Run.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('goblin-attack', '/assets/enemies/Goblin/Attack.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('goblin-death', '/assets/enemies/Goblin/Death.png', { frameWidth: 150, frameHeight: 150 });

    this.load.spritesheet('mushroom', '/assets/enemies/Mushroom/Idle.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('mushroom-walk', '/assets/enemies/Mushroom/Run.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('mushroom-attack', '/assets/enemies/Mushroom/Attack.png', { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('mushroom-death', '/assets/enemies/Mushroom/Death.png', { frameWidth: 150, frameHeight: 150 });

    //PROJECTILES
    this.load.spritesheet('comet', 'assets/Effect_and_FX_Pixel_Part_12_Free/Effect and FX Pixel Part 12 Free/579.png', { frameWidth: 896/14, frameHeight: 576/9 });
    this.load.spritesheet('comet_2', 'assets/Effect_and_FX_Pixel_Part_12_Free/Effect and FX Pixel Part 12 Free/567.png', { frameWidth: 832/13, frameHeight: 576/9 });
    this.load.spritesheet('venom_projectile', 'assets/Effect_and_FX_Pixel_Part_12_Free/Effect and FX Pixel Part 12 Free/586.png', { frameWidth: 832/13, frameHeight: 576/9 });
  
    //SKILLS
    this.load.image('aura', 'assets/aura.png');
    this.load.image('venom', 'assets/venom.png');
    this.load.spritesheet('lightning', 'assets/LightningFreePack/256/Lightning_2_256-sheet.png', { frameWidth: 1024/4, frameHeight: 1024/4 });

    //LOOT
    this.load.spritesheet('coin', 'assets/coin.png', { frameWidth: 256/8, frameHeight: 32 });

    //MODAL
    this.load.image('modal-background', 'assets/Modal/bg.svg');

    //JOYSTICK
    this.load.image('joystick-bg', 'assets/joystick/JoystickSplitted.png');
    this.load.image('joystick-thumb', 'assets/joystick/LargeHandleFilledGrey.png');
  }

  create() {
    // Cuando se haya cargado, pasar a la siguiente escena
    setTimeout(() => {
      this.scene.start('GameScene');
    } , 1000); // Espera 1 segundo antes de iniciar la siguiente escena
  }
}

export default LoaderScene;
