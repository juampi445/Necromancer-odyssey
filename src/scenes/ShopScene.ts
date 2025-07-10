// ShopScene.ts
export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create() {
    const { width, height } = this.scale;

    // Green background
    this.add.rectangle(width / 2, height / 2, width, height, 0x28a745);

    this.add.text(width / 2, 80, 'Tienda', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const items = ['Velocidad', 'Escudo', 'Vida Extra'];

    items.forEach((item, index) => {
      this.add.text(width / 2, 160 + index * 60, item, {
        fontSize: '24px',
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
    });

    // Back button
    this.add.text(width / 2, height - 100, '⬅ Volver', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#6c757d',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
