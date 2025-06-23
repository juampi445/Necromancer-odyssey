import React, { useState, useEffect } from 'react';
import '../style/startmenu.css';
import '../style/startgamebutton.css';
import Logo from '../../public/logo'; // Assuming this is a React component

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
  const [isClient, setIsClient] = useState(false);

  // Ensure that the component is only rendered on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container">
      {isClient && <div className="logo-container" style={{ zIndex: 10 }}>
        <Logo />
      </div>} {/* This will only render the logo on the client */}
        
      {/* Add the overlay div */}
      <div className="overlay"></div>  {/* This is the overlay */}
      
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
