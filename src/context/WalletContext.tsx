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

  // ✅ FIXED PROFILE SYNC (handles missing user)
  const syncProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // ✅ no crash if missing

      if (error) throw error;

      let profile = data;

      // ✅ AUTO CREATE PROFILE IF NOT EXISTS
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            balance: 0,
            inventory: [],
            hp: 100,
            max_hp: 100,
            last_daily_claim: null
          })
          .select()
          .single();

        if (insertError) throw insertError;
        profile = newProfile;
      }

      // ✅ APPLY DATA
      setBalance(profile.balance || 0);
      setInventory(profile.inventory || []);
      setLastClaim(profile.last_daily_claim || null);
      setIsOwner(profile.is_owner || profile.username?.toLowerCase() === 'cane');

      let atk = 10, def = 5;
      (profile.inventory || []).forEach((i: any) => {
        if (i.type === 'weapon') atk += i.stat;
        if (i.type === 'armor') def += i.stat;
      });

      setStats({
        hp: profile.hp || 100,
        maxHp: profile.max_hp || 100,
        attack: atk,
        defense: def
      });

      return profile;

    } catch (e) {
      console.error("Sync error:", e);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          // ✅ SET USER IMMEDIATELY (IMPORTANT FIX)
          setUser(session.user);

          const profile = await syncProfile(session.user.id);

          if (!mounted) return;

          setUser({
            ...session.user,
            username: profile?.username || session.user.email?.split('@')[0]
          });
        }
      } catch (e) {
        console.error("Init error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // ✅ AUTH LISTENER (FIXED)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);

        const profile = await syncProfile(session.user.id);

        if (!mounted) return;

        setUser({
          ...session.user,
          username: profile?.username || session.user.email?.split('@')[0]
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: any) => {
    if (!user) return;

    if (updates.balance !== undefined) setBalance(updates.balance);

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) await syncProfile(user.id);
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
        await updateProfile({
          balance: balance + 15000,
          last_daily_claim: now
        });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null);
      }
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);