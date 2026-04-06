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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (error && error.code === 'PGRST116') {
        // Profile missing - Create it
        const { data: newProfile } = await supabase.from('profiles').insert([
          { id: userId, username: 'player_' + userId.slice(0, 5), balance: 5000 }
        ]).select().single();
        return newProfile;
      }
      return data;
    } catch (e) {
      console.error("Profile fetch error", e);
      return null;
    }
  };

  const syncState = (profile: any) => {
    if (!profile) return;
    setBalance(profile.balance);
    setInventory(profile.inventory || []);
    setLastClaim(profile.last_daily_claim === '-infinity' ? null : profile.last_daily_claim);
    setIsOwner(profile.is_owner || profile.username?.toLowerCase() === 'cane');
    
    let atk = 10, def = 5;
    (profile.inventory || []).forEach((item: any) => {
      if (item.type === 'weapon') atk += item.stat;
      if (item.type === 'armor') def += item.stat;
    });
    setStats({ hp: profile.hp || 100, maxHp: profile.max_hp || 100, attack: atk, defense: def });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setUser({ ...session.user, username: profile?.username });
          syncState(profile);

          // LIVE UPDATE LISTENER
          supabase.channel(`realtime_profile_${session.user.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, 
            (payload) => syncState(payload.new))
            .subscribe();
        }
      } catch (e) {
        console.error("Initialization error", e);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await fetchProfile(session.user.id);
        setUser({ ...session.user, username: profile?.username });
        syncState(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: any) => {
    if (!user) return;
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
      },
      signOut: () => supabase.auth.signOut()
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);