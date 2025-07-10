import * as Phaser from 'phaser';
import LoaderScene from './scenes/LoaderScene';
import GameScene from './scenes/GameScene';
import UIOverlay from './scenes/UiOverlay';
import PauseModalScene from './scenes/PauseModalScene';
import MainMenuScene from './scenes/MainMenuScene';
import ShopScene from './scenes/ShopScene';
// import SkillsModal from './GameObjects/SkillsModal';

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
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [LoaderScene, MainMenuScene, GameScene, ShopScene, UIOverlay, PauseModalScene],
};

export default gameConfig;
