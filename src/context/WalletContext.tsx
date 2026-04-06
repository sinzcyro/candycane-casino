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

  const syncProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setBalance(data.balance || 0);
        setInventory(data.inventory || []);
        setLastClaim(data.last_daily_claim === '-infinity' ? null : data.last_daily_claim);
        setIsOwner(data.is_owner || data.username?.toLowerCase() === 'cane');
        
        let atk = 10, def = 5;
        (data.inventory || []).forEach((i: any) => {
          if (i.type === 'weapon') atk += i.stat;
          if (i.type === 'armor') def += i.stat;
        });
        setStats({ hp: data.hp || 100, maxHp: data.max_hp || 100, attack: atk, defense: def });
        return data;
      }
    } catch (e) {
      console.error("Sync error:", e);
    }
    return null;
  };

  useEffect(() => {
    // SAFETY: If DB is slow, stop loading after 2.5 seconds no matter what
    const timer = setTimeout(() => setLoading(false), 2500);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncProfile(session.user.id).then(p => {
          setUser({ ...session.user, username: p?.username || session.user.email?.split('@')[0] });
          setLoading(false);
          clearTimeout(timer);
        });
      } else {
        setLoading(false);
        clearTimeout(timer);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const p = await syncProfile(session.user.id);
        setUser({ ...session.user, username: p?.username });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const updateProfile = async (updates: any) => {
    if (!user) return;
    if (updates.balance !== undefined) setBalance(updates.balance);
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) syncProfile(user.id);
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, stats, inventory, isOwner, loading, lastClaim,
      addWin: (n: number) => updateProfile({ balance: balance + n }),
      removeBet: (n: number) => updateProfile({ balance: balance - n }),
      setExactBalance: (n: number) => updateProfile({ balance: n }),
      updateInventory: (i: any[]) => updateProfile({ inventory: i }),
      claimDaily: async () => {
        const now = new Date().toISOString();
        await updateProfile({ balance: balance + 15000, last_daily_claim: now });
      },
      signOut: () => supabase.auth.signOut()
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);