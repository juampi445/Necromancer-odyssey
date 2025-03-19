// components/StartMenu.tsx

import React from 'react';
import '../style/startmenu.css'; // Importar el archivo CSS

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  return (
    <div className="container">
      <h1 className="heading">Welcome to My Game</h1>
      <button className="button" onClick={onStart}>Start Game</button>
    </div>
  );
};

export default StartMenu;
