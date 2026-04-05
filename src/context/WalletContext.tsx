import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const WalletContext = createContext<any>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
      else setLoading(false);
    });

    // Listen for sign-in/sign-out
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user);
      else {
        setUser(null);
        setBalance(0);
        setIsOwner(false);
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userAuth: any) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userAuth.id).single();
    
    if (data) {
      setUser({ ...userAuth, username: data.username });
      setBalance(data.balance);
      setIsOwner(data.is_owner || data.username === 'cane');
    } else if (error) {
       console.error("Profile Fetch Error:", error);
    }
    setLoading(false);
  };

  const updateBalance = async (newBalance: number) => {
    setBalance(newBalance);
    if (user) await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, isOwner, loading,
      addWin: (amt: number) => updateBalance(balance + amt),
      removeBet: (amt: number) => updateBalance(balance - amt),
      signOut: () => supabase.auth.signOut()
    }}>
      {!loading && children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);