import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import gameConfig from '../gameConfig';  // Configuración del juego

export type GameCanvasProps = {
  onGoBack: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGoBack }) => {
  const gameContainer = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameContainer.current && !gameRef.current) {
      // Asignar el id del div al contenedor del juego en la configuración
      const config = { ...gameConfig, parent: gameContainer.current };
      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true); // Destruir la instancia del juego y el canvas
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div id="game-container" ref={gameContainer} style={{ width: '100%', height: '100%' }} />
      <button style={{ position: 'absolute', left: 0, bottom: 0 }} onClick={onGoBack}>Go Back</button>
    </>
  );
};

export default GameCanvas;
