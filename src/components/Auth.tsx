import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { username: username.toLowerCase() } }
        });
        if (error) throw error;
        alert("Account created successfully! Logging you in...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0202] p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a0505] p-12 rounded-[3.5rem] border border-white/5 w-full max-w-md shadow-2xl text-center">
        <img src="/candycane.png" className="h-24 mx-auto mb-8" alt="Logo" />
        <h2 className="text-4xl font-black italic uppercase mb-10 tracking-tighter">
          {isSignUp ? 'Join The Lab' : 'Ready To Roll?'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input type="text" placeholder="CHOOSE USERNAME" className="w-full bg-black p-5 rounded-2xl outline-none border border-white/10 focus:border-red-600 font-bold uppercase transition-all" value={username} onChange={e => setUsername(e.target.value)} required />
          )}
          <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-black p-5 rounded-2xl outline-none border border-white/10 focus:border-red-600 font-bold uppercase transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="w-full bg-black p-5 rounded-2xl outline-none border border-white/10 focus:border-red-600 font-bold uppercase transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
          
          <button disabled={loading} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase shadow-xl shadow-red-600/30 active:scale-95 transition-all text-white text-lg tracking-widest">
            {loading ? 'PROCESSING...' : (isSignUp ? 'CREATE ACCOUNT' : 'LOGIN')}
          </button>
        </form>
        
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-8 text-white/30 hover:text-white font-black text-xs uppercase tracking-[0.2em] block w-full transition-colors">
          {isSignUp ? 'Already a player? Sign In' : 'New here? Create your jar'}
        </button>
      </motion.div>
    </div>
  );
};