import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const WalletContext = createContext<any>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user);
      else setUser(null);
    });
  }, []);

  const fetchProfile = async (userAuth: any) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userAuth.id).single();
    if (data) {
      setUser({ ...userAuth, username: data.username });
      setBalance(data.balance);
      setIsOwner(data.is_owner || data.username === 'cane'); // Hardcoded owner check for you
    }
  };

  const updateBalance = async (newBalance: number) => {
    setBalance(newBalance);
    if (user) {
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
    }
  };

  return (
    <WalletContext.Provider value={{ 
      user, 
      balance, 
      isOwner,
      addWin: (amt: number) => updateBalance(balance + amt),
      removeBet: (amt: number) => updateBalance(balance - amt),
      signOut: () => supabase.auth.signOut()
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);