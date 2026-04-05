import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const WalletContext = createContext<any>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [lastClaim, setLastClaim] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user);
      else { setUser(null); setBalance(0); setIsOwner(false); setLoading(false); }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userAuth: any) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userAuth.id).single();
    if (data) {
      setUser({ ...userAuth, username: data.username });
      setBalance(data.balance);
      setIsOwner(data.is_owner || data.username.toLowerCase() === 'cane');
      setLastClaim(data.last_daily_claim?.includes('1970') ? null : data.last_daily_claim);
    }
    setLoading(false);
  };

  const updateBalance = async (newBalance: number) => {
    setBalance(newBalance);
    if (user) await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
  };

  return (
    <WalletContext.Provider value={{ 
      user, balance, isOwner, loading, lastClaim,
      addWin: (amt: number) => updateBalance(balance + amt),
      removeBet: (amt: number) => updateBalance(balance - amt),
      setExactBalance: (amt: number) => updateBalance(amt),
      claimDaily: async () => {
        const now = new Date().toISOString();
        const newBal = balance + 15000;
        setBalance(newBal);
        setLastClaim(now);
        await supabase.from('profiles').update({ balance: newBal, last_daily_claim: now }).eq('id', user.id);
      },
      signOut: () => supabase.auth.signOut()
    }}>
      {!loading && children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);