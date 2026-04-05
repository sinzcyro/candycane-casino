import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const WalletContext = createContext<any>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
      else setLoading(false);
    });

    // 2. Listen for login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setBalance(0);
        setIsOwner(false);
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userAuth: any) => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userAuth.id)
        .single();

      // IF PROFILE DOESN'T EXIST (THE BUG FIX)
      if (error || !data) {
        const username = userAuth.user_metadata?.username || userAuth.email.split('@')[0];
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userAuth.id, 
            username: username, 
            balance: 5000,
            is_owner: username === 'cane'
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        data = newProfile;
      }

      if (data) {
        setUser({ ...userAuth, username: data.username });
        setBalance(data.balance);
        setIsOwner(data.is_owner || data.username === 'cane');
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error("Profile Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (newBalance: number) => {
    setBalance(newBalance);
    if (user) {
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
    }
  };

  const buyItem = async (itemId: string, price: number) => {
    if (balance >= price && !inventory.includes(itemId)) {
      const newInv = [...inventory, itemId];
      const newBal = balance - price;
      setBalance(newBal);
      setInventory(newInv);
      await supabase.from('profiles').update({ balance: newBal, inventory: newInv }).eq('id', user.id);
      return true;
    }
    return false;
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, isOwner, inventory, loading,
      addWin: (amt: number) => updateBalance(balance + amt),
      removeBet: (amt: number) => updateBalance(balance - amt),
      buyItem,
      signOut: () => supabase.auth.signOut()
    }}>
      {!loading && children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);