// MainMenuScene.ts
export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Blue background
    this.add.rectangle(width / 2, height / 2, width, height, 0x007BFF);

    this.add.text(width / 2, 150, 'Menú Principal', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Play button
    this.add.text(width / 2, 260, '▶️ Jugar', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#28a745',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
        this.scene.start('GameScene');         // start gameplay
        this.scene.launch('UIOverlay'); 
    });

    // Shop button
    this.add.text(width / 2, 330, '🛍 Ir a Tienda', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#ffc107',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
      this.scene.start('ShopScene');
    });
  }
}
