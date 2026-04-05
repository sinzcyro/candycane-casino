import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext<any>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('cc-balance');
    return saved ? parseInt(saved) : 5000;
  });

  const [inventory, setInventory] = useState<string[]>(() => {
    const saved = localStorage.getItem('cc-inventory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cc-balance', balance.toString());
    localStorage.setItem('cc-inventory', JSON.stringify(inventory));
  }, [balance, inventory]);

  const addWin = (amt: number) => setBalance(prev => prev + amt);
  const removeBet = (amt: number) => setBalance(prev => prev - amt);
  const buyItem = (id: string, price: number) => {
    if (balance >= price && !inventory.includes(id)) {
      setBalance(prev => prev - price);
      setInventory(prev => [...prev, id]);
      return true;
    }
    return false;
  };

  return (
    <WalletContext.Provider value={{ balance, addWin, removeBet, inventory, buyItem }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);