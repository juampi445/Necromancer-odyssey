// components/StartMenu.tsx

import React from 'react';
import '../style/startmenu.css'; // Importar el archivo CSS
import '../style/startgamebutton.css';
import Logo from '../../public/logo'; // Asegúrate de que la ruta al logo sea correcta

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  return (
    <div className="container">
      {/* Usar el componente Logo */}
      <Logo />
      <button onClick={onStart} className="button-82-pushable" role="button">
        <span className="button-82-shadow"></span>
        <span className="button-82-edge"></span>
        <span className="button-82-front text">
          Start Game
        </span>
      </button>
    </div>
  );
};

export default StartMenu;
