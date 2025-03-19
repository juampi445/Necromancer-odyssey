import React from 'react';

interface ShopMenuProps {
  onClose: () => void;
}

const ShopMenu: React.FC<ShopMenuProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div>
        <h1>Shop</h1>
        <p>Buy items for your character here.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ShopMenu;
