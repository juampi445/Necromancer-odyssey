import * as Phaser from 'phaser';
import LoaderScene from './scenes/LoaderScene';
import GameScene from './scenes/GameScene';
import UIOverlay from './GameObjects/UiOverlay';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  physics: {
    default: 'arcade',  // Asegúrate de usar 'arcade' o el tipo de física que prefieras
    arcade: {
      gravity: {
          y: 0,
          x: 0
      }, // Opcional, ajusta la gravedad si lo necesitas
      debug: false, // Opcional, activa el modo debug si quieres ver la física
    },
  },
  scene: [LoaderScene, GameScene, UIOverlay], // Escenas que se cargarán
};

export default gameConfig;
