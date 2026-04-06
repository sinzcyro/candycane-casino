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
  const [loading, setLoading] = useState(true);

  // Helper to sync local state with a profile object
  const syncLocalState = (profile: any) => {
    if (!profile) return;
    setBalance(profile.balance || 0);
    setInventory(profile.inventory || []);
    setLastClaim(profile.last_daily_claim === '-infinity' ? null : profile.last_daily_claim);
    setLastExplore(profile.last_explore === '-infinity' ? null : profile.last_explore);
    setIsOwner(profile.is_owner || profile.username?.toLowerCase() === 'cane');
    
    let atk = 10, def = 5;
    (profile.inventory || []).forEach((item: any) => {
      if (item.type === 'weapon') atk += item.stat;
      if (item.type === 'armor') def += item.stat;
    });
    setStats({ hp: profile.hp || 100, maxHp: profile.max_hp || 100, attack: atk, defense: def });
  };

  const fetchAndSync = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        syncLocalState(data);
        return data;
      }
      // If profile missing, the logic in App/Auth will handle creation or we can upsert here
      return null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Safety Timeout: Force stop loading after 4 seconds no matter what
    const timer = setTimeout(() => setLoading(false), 4000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchAndSync(session.user.id);
          setUser({ ...session.user, username: profile?.username || session.user.email?.split('@')[0] });

          // Realtime Listener
          supabase.channel(`any_profile_${session.user.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, 
            (payload) => syncLocalState(payload.new))
            .subscribe();
        }
      } catch (e) {
        console.error("Auth init error", e);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchAndSync(session.user.id);
        setUser({ ...session.user, username: profile?.username || session.user.email?.split('@')[0] });
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
    // Optimistic UI update
    if (updates.balance !== undefined) setBalance(updates.balance);
    await supabase.from('profiles').update(updates).eq('id', user.id);
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, stats, inventory, isOwner, loading, lastClaim, lastExplore,
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
        await updateProfile({ inventory: [...inventory, foundItem], last_explore: now });
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