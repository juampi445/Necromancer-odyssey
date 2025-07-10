export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background texture
    this.add.tileSprite(width / 2, height / 2, width, height, 'modal-bg');

    // Beige overlay filter
    this.add.rectangle(width / 2, height / 2, width, height, 0x797562, 0.75);

    // Title
    this.add.text(width / 2, 80, 'Shop', {
      fontSize: '36px',
      color: '#333333',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const buttonWidth = 240;
    const buttonFont = '22px';
    const buttonPadding = { x: 20, y: 10 };

    const items = ['Speed', 'Shield', 'Extra Life'];

    items.forEach((item, index) => {
      this.add.text(width / 2, 160 + index * 60, item, {
        fontSize: buttonFont,
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: buttonPadding,
        fixedWidth: buttonWidth,
        align: 'center'
      }).setOrigin(0.5);
    });

    // Back button
    this.add.text(width / 2, height - 100, 'Go Back', {
      fontSize: buttonFont,
      color: '#ffffff',
      backgroundColor: '#6c757d',
      padding: buttonPadding,
      fixedWidth: buttonWidth,
      align: 'center'
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
