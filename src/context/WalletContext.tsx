import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const WalletContext = createContext<any>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({ hp: 100, maxHp: 100, attack: 10, defense: 5 });
  const [inventory, setInventory] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [lastClaim, setLastClaim] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userAuth: any) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userAuth.id).single();
    if (data) {
      setUser({ ...userAuth, username: data.username });
      setBalance(data.balance);
      setStats({ hp: data.hp, maxHp: data.max_hp, attack: data.attack, defense: data.defense });
      setInventory(data.inventory || []);
      setIsOwner(data.is_owner || data.username.toLowerCase() === 'cane');
      setLastClaim(data.last_daily_claim === '-infinity' ? null : data.last_daily_claim);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });
  }, []);

  const updateProfile = async (updates: any) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) {
        // Update local state immediately for fast UI
        if (updates.balance !== undefined) setBalance(updates.balance);
        if (updates.last_daily_claim !== undefined) setLastClaim(updates.last_daily_claim);
        if (updates.inventory !== undefined) setInventory(updates.inventory);
        // Refresh full stats
        fetchProfile(user);
    }
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, stats, inventory, isOwner, loading, lastClaim,
      addWin: (amt: number) => updateProfile({ balance: balance + amt }),
      removeBet: (amt: number) => updateProfile({ balance: balance - amt }),
      setExactBalance: (amt: number) => updateProfile({ balance: amt }),
      updateStats: (newStats: any) => updateProfile(newStats),
      updateInventory: (newInv: any[]) => updateProfile({ inventory: newInv }),
      claimDaily: async () => {
        const now = new Date().toISOString();
        const newBal = balance + 15000;
        await updateProfile({ balance: newBal, last_daily_claim: now });
      },
      signOut: () => supabase.auth.signOut()
    }}>
      {!loading && children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);