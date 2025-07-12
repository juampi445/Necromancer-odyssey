import { GlobalDataSingleton } from "@/data/GlobalDataSingleton";

export default class MainMenuScene extends Phaser.Scene {
  private confirmContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background texture
    this.add.tileSprite(width / 2, height / 2, width, height, 'modal-bg');

    this.add.rectangle(width / 2, height / 2, width, height, 0x0b1a2b, 0.75);

    // Title
    this.add.text(width / 2, 80, 'Main Menu', {
      fontSize: '36px',
      color: '#f8f9fa', // a cool white
      fontStyle: 'bold',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const buttonWidth = 240;
    const buttonFont = '22px';
    const buttonPadding = { x: 20, y: 10 };

    // Play button
    this.add.text(width / 2, 260, 'Play', {
      fontSize: buttonFont,
      color: '#ffffff',
      backgroundColor: '#28a745',
      padding: buttonPadding,
      fixedWidth: buttonWidth,
      align: 'center'
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.scene.start('GameScene');
      this.scene.launch('UIOverlay');
    });

    // Shop button
    this.add.text(width / 2, 330, 'Shop', {
      fontSize: buttonFont,
      color: '#000000',
      backgroundColor: '#ffc107',
      padding: buttonPadding,
      fixedWidth: buttonWidth,
      align: 'center'
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.scene.start('ShopScene');
    });
    // Reset button (red)
    const resetButton = this.add.text(width / 2, 400, 'Reset Progress', {
      fontSize: buttonFont,
      color: '#ffffff',
      backgroundColor: '#dc3545', // bootstrap danger red
      padding: buttonPadding,
      fixedWidth: buttonWidth,
      align: 'center',
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.showConfirmModal();
    });
    console.log('MainMenuScene created reset button:', resetButton);

    window.addEventListener('beforeunload', () => {
      GlobalDataSingleton.instance.save();
    });

    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      GlobalDataSingleton.instance.save();
    });
  }

  private showConfirmModal() {
    const { width, height } = this.scale;

    // Si ya hay un modal abierto, no hacer nada
    if (this.confirmContainer) return;

    // Fondo semitransparente
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    
    // Caja blanca pequeña
    const boxWidth = 360;
    const boxHeight = 180;
    const box = this.add.rectangle(width / 2, height / 2, boxWidth, boxHeight, 0xffffff, 1).setStrokeStyle(2, 0x000000);

    // Texto de confirmación
    const text = this.add.text(width / 2, height / 2 - 40, 'Are you sure you want to reset all progress?', {
      fontSize: '20px',
      color: '#000000',
      wordWrap: { width: boxWidth - 40 },
      align: 'center',
    }).setOrigin(0.5);

    // Botón Yes
    const yesButton = this.add.text(width / 2 - 70, height / 2 + 50, 'Yes', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#28a745',
      padding: { x: 20, y: 10 },
      fixedWidth: 100,
      align: 'center',
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      GlobalDataSingleton.instance.reset();
      GlobalDataSingleton.instance.save();
      this.confirmContainer?.destroy();
      this.confirmContainer = undefined;
      this.scene.restart();
    });

    // Botón No
    const noButton = this.add.text(width / 2 + 70, height / 2 + 50, 'No', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#dc3545',
      padding: { x: 20, y: 10 },
      fixedWidth: 100,
      align: 'center',
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.confirmContainer?.destroy();
      this.confirmContainer = undefined;
    });

    this.confirmContainer = this.add.container(0, 0, [bg, box, text, yesButton, noButton]);
  }
}
