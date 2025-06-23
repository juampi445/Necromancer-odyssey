"use client";
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import StartMenu from '../components/StartMenu';

// Dynamically import GameCanvas with SSR disabled
const GameCanvas = dynamic(() => import('../components/GameCanvas'), { ssr: false });

const Home: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure the component is mounted on the client
  }, []);

  const handleStartGame = (started: boolean) => {
    setGameStarted(started);
  };

  if (!isClient) {
    // Return null to avoid server-client mismatch during hydration
    return null;
  }

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', background: 'lightgrey' }}>
      {!gameStarted && <StartMenu onStart={() => handleStartGame(true)} />}
      {gameStarted && <GameCanvas onGoBack={() => handleStartGame(false)} />}
    </div>
  );
};

export default Home;
