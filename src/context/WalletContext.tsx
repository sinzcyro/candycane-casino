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

  // This function is now "Silent" - it won't crash the app if it fails
  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setBalance(data.balance || 0);
        setInventory(data.inventory || []);
        setLastClaim(data.last_daily_claim === '-infinity' ? null : data.last_daily_claim);
        setIsOwner(data.is_owner || data.username?.toLowerCase() === 'cane');
        
        let atk = 10, def = 5;
        (data.inventory || []).forEach((item: any) => {
          if (item.type === 'weapon') atk += item.stat;
          if (item.type === 'armor') def += item.stat;
        });
        setStats({ hp: data.hp || 100, maxHp: data.max_hp || 100, attack: atk, defense: def });
        return data;
      }
    } catch (e) { console.error("DB Fetch Error ignored to prevent hang"); }
    return null;
  };

  useEffect(() => {
    // EMERGENCY FORCE LOAD: Site opens in 2 seconds no matter what
    const forceLoad = setTimeout(() => setLoading(false), 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setUser({ ...session.user, username: p?.username || session.user.email?.split('@')[0] });
          setLoading(false);
          clearTimeout(forceLoad);
        });
      } else {
        setLoading(false);
        clearTimeout(forceLoad);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setUser({ ...session.user, username: p?.username || session.user.email?.split('@')[0] });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
        authListener.subscription.unsubscribe();
        clearTimeout(forceLoad);
    };
  }, []);

  const updateProfile = async (updates: any) => {
    if (!user) return;
    if (updates.balance !== undefined) setBalance(updates.balance);
    await supabase.from('profiles').update(updates).eq('id', user.id);
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, stats, inventory, isOwner, loading, lastClaim,
      addWin: (amt: number) => updateProfile({ balance: balance + amt }),
      removeBet: (amt: number) => updateProfile({ balance: balance - amt }),
      setExactBalance: (amt: number) => updateProfile({ balance: amt }),
      updateInventory: (newInv: any[]) => updateProfile({ inventory: newInv }),
      claimDaily: async () => {
        const now = new Date().toISOString();
        await updateProfile({ balance: balance + 15000, last_daily_claim: now });
        setLastClaim(now);
      },
      signOut: () => supabase.auth.signOut()
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);