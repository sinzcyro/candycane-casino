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
  const [lastExplore, setLastExplore] = useState<string | null>(null);

  const syncProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setBalance(data.balance || 0);
        setInventory(data.inventory || []);
        setLastClaim(data.last_daily_claim === '-infinity' ? null : data.last_daily_claim);
        setLastExplore(data.last_explore === '-infinity' ? null : data.last_explore);
        setIsOwner(data.is_owner || data.username?.toLowerCase() === 'cane');
        
        let atk = 10, def = 5;
        (data.inventory || []).forEach((item: any) => {
          if (item.type === 'weapon') atk += item.stat;
          if (item.type === 'armor') def += item.stat;
        });
        setStats({ hp: data.hp || 100, maxHp: data.max_hp || 100, attack: atk, defense: def });
        return data;
      }
    } catch (e) { console.error("Sync Error:", e); }
    return null;
  };

  useEffect(() => {
    // Check session instantly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncProfile(session.user.id).then((p) => {
          setUser({ ...session.user, username: p?.username || session.user.email?.split('@')[0] });
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const p = await syncProfile(session.user.id);
        setUser({ ...session.user, username: p?.username });
      } else {
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: any) => {
    if (!user) return;
    if (updates.balance !== undefined) setBalance(updates.balance);
    await supabase.from('profiles').update(updates).eq('id', user.id);
    syncProfile(user.id); 
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, stats, inventory, isOwner, lastClaim, lastExplore,
      addWin: (amt: number) => updateProfile({ balance: balance + amt }),
      removeBet: (amt: number) => updateProfile({ balance: balance - amt }),
      setExactBalance: (amt: number) => updateProfile({ balance: amt }),
      updateInventory: (newInv: any[]) => updateProfile({ inventory: newInv }),
      claimDaily: async () => {
        const now = new Date().toISOString();
        await updateProfile({ balance: balance + 15000, last_daily_claim: now });
      },
      exploreWorld: async (foundItem: any) => {
        const now = new Date().toISOString();
        const newInv = [...inventory, foundItem];
        await updateProfile({ inventory: newInv, last_explore: now });
      },
      sellItem: async (index: number, price: number) => {
        const newInv = [...inventory];
        newInv.splice(index, 1);
        await updateProfile({ inventory: newInv, balance: balance + price });
      },
      signOut: () => supabase.auth.signOut()
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);