import { GlobalDataSingleton } from "@/data/GlobalDataSingleton";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background texture
    this.add.tileSprite(width / 2, height / 2, width, height, 'modal-bg');

    // Beige filter overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x797562, 0.75);

    // Title
    this.add.text(width / 2, 80, 'Main Menu', {
      fontSize: '36px',
      color: '#333333',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const buttonWidth = 240;
    // const buttonHeight = 50;
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

    window.addEventListener('beforeunload', () => {
      GlobalDataSingleton.instance.save();
    });

    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      GlobalDataSingleton.instance.save();
    });
  }
}
