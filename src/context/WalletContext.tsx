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
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setBalance(data.balance);
      setInventory(data.inventory || []);
      setStats({ hp: data.hp, maxHp: data.max_hp, attack: data.attack, defense: data.defense });
      setIsOwner(data.is_owner || data.username.toLowerCase() === 'cane');
      setLastClaim(data.last_daily_claim === '-infinity' ? null : data.last_daily_claim);
      return data;
    }
    return null;
  };

  useEffect(() => {
    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser({ ...session.user, username: profile?.username });

        // --- LIVE UPDATE LISTENER ---
        const channel = supabase
          .channel('schema-db-changes')
          .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, 
            (payload) => {
              console.log('LIVE UPDATE RECEIVED:', payload.new);
              setBalance(payload.new.balance);
              setStats(prev => ({ ...prev, hp: payload.new.hp }));
              setInventory(payload.new.inventory || []);
            }
          )
          .subscribe((status) => {
            console.log('REALTIME STATUS:', status);
          });

        return () => { supabase.removeChannel(channel); };
      }
      setLoading(false);
    };

    setup();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setup();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: any) => {
    if (!user) return;
    // We update DB. The "channel" listener above will catch the change and update the screen.
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
      {!loading && children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);