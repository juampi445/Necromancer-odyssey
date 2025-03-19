"use client"
import React, { useState } from 'react';
import ShopMenu from '../components/ShopMenu';

const ShopPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleCloseShop = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <h1>Shop Page</h1>
      {isOpen && <ShopMenu onClose={handleCloseShop} />}
    </div>
  );
};

export default ShopPage;
