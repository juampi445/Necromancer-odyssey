import * as Phaser from 'phaser';
import LoaderScene from './scenes/LoaderScene';
import GameScene from './scenes/GameScene';
import UIOverlay from './scenes/UiOverlay';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
          y: 0,
          x: 0
      },
      debug: false,
    },
  },
  scene: [LoaderScene, GameScene, UIOverlay],
};

export default gameConfig;
