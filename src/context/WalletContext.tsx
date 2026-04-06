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

  const refresh = async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
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
    return null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        refresh(session.user.id).then(p => setUser((prev: any) => ({ ...prev, username: p?.username })));
      }
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const p = await refresh(session.user.id);
        setUser((prev: any) => ({ ...prev, username: p?.username }));
      } else {
        setUser(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const update = async (ups: any) => {
    if (!user) return;
    if (ups.balance !== undefined) setBalance(ups.balance);
    await supabase.from('profiles').update(ups).eq('id', user.id);
    refresh(user.id);
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, stats, inventory, isOwner, lastClaim,
      addWin: (n: number) => update({ balance: balance + n }),
      removeBet: (n: number) => update({ balance: balance - n }),
      setExactBalance: (n: number) => update({ balance: n }),
      updateInventory: (i: any[]) => update({ inventory: i }),
      claimDaily: async () => {
        const now = new Date().toISOString();
        await update({ balance: balance + 15000, last_daily_claim: now });
      },
      signOut: () => supabase.auth.signOut()
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);