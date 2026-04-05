import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // We create a fake email using the username so Supabase accepts it
    const fakeEmail = `${username.toLowerCase()}@candycane.cc`;

    try {
      if (isSignUp) {
        // 1. Create the Auth Account
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
          email: fakeEmail, 
          password,
          options: { data: { username: username.toLowerCase() } }
        });
        if (authError) throw authError;

        // 2. Create the Profile Row
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').upsert([{ 
            id: authData.user.id, 
            username: username.toLowerCase(), 
            balance: 5000,
            is_owner: username.toLowerCase() === 'cane'
          }]);
          if (profileError) throw profileError;
          alert("Account Created! You can now Login.");
          setIsSignUp(false);
        }
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({ 
          email: fakeEmail, 
          password 
        });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0202] p-6 font-sans">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 w-full max-w-md shadow-2xl text-center">
        <img src="/candycane.png" className="h-24 mx-auto mb-8" alt="Logo" />
        <h2 className="text-4xl font-black italic uppercase mb-10 tracking-tighter">
          {isSignUp ? 'Join The Lab' : 'Ready To Roll?'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="text" 
            placeholder="USERNAME" 
            className="w-full bg-black p-5 rounded-2xl outline-none border border-white/10 focus:border-red-600 font-bold uppercase transition-all" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full bg-black p-5 rounded-2xl outline-none border border-white/10 focus:border-red-600 font-bold uppercase transition-all" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          
          <button disabled={loading} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase shadow-xl shadow-red-600/30 active:scale-95 transition-all text-white text-lg">
            {loading ? '...' : (isSignUp ? 'CREATE ACCOUNT' : 'LOGIN')}
          </button>
        </form>
        
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-8 text-white/30 hover:text-white font-black text-xs uppercase tracking-[0.2em] block w-full">
          {isSignUp ? 'Already a player? Sign In' : 'New here? Sign Up'}
        </button>
      </motion.div>
    </div>
  );
};