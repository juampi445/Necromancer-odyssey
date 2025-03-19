// src/app/page.tsx

"use client";
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import StartMenu from '../components/StartMenu';

// Dynamically import GameCanvas with SSR disabled
const GameCanvas = dynamic(() => import('../components/GameCanvas'), { ssr: false });

const Home: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = (started: boolean) => {
    setGameStarted(started);
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', background: 'lightgrey' }}>
      {!gameStarted && <StartMenu onStart={() => handleStartGame(true)} />}
      {gameStarted && <GameCanvas onGoBack={() => handleStartGame(false)}/>}
    </div>

  );
};

export default Home;
