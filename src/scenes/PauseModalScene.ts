export default class PauseModalScene extends Phaser.Scene {
  constructor() {
    super('PauseModalScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    const modalWidth = 300;
    const modalHeight = 220;

    const modalContainer = this.add.container(width / 2, height / 2);

    const modalBg = this.add.tileSprite(0, 0, modalWidth, modalHeight, 'modal-bg').setOrigin(0.5);
    const beigeOverlay = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x797562, 0.75).setOrigin(0.5);
    const border = this.add.rectangle(0, 0, modalWidth, modalHeight).setOrigin(0.5).setStrokeStyle(2, 0x000000);

    modalContainer.add([modalBg, beigeOverlay, border]);

    this.add.text(width / 2 + modalWidth / 2 - 10, height / 2 - modalHeight / 2 + 10, '❌', {
      fontSize: '24px',
      color: '#000000'
    })
      .setOrigin(1, 0)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.stop('PauseModalScene');
        this.scene.resume('GameScene');
      });

    this.add.text(width / 2, height / 2 - 60, 'Pausa', {
      fontSize: '26px',
      color: '#000000'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, 'Salir', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#dc3545',
      padding: { x: 15, y: 5 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.stop('GameScene');
        this.scene.stop('UIOverlay');
        this.scene.stop('SkillsModal');
        this.scene.stop();
        this.scene.start('MainMenuScene');
      });
  }
}
