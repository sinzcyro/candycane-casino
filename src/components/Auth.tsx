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
    
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (data.user) {
        await supabase.from('profiles').insert([{ id: data.user.id, username, balance: 5000 }]);
        alert("Account Created! You can now login.");
        setIsSignUp(false);
      }
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0202] p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 w-full max-w-md shadow-2xl">
        <img src="/candycane.png" className="h-20 mx-auto mb-8" alt="Logo" />
        <h2 className="text-3xl font-black text-center italic uppercase mb-8">{isSignUp ? 'Join the Jar' : 'Welcome Back'}</h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <input type="text" placeholder="USERNAME" className="w-full bg-black p-4 rounded-2xl outline-none border border-white/5 focus:border-red-500" value={username} onChange={e => setUsername(e.target.value)} required />
          )}
          <input type="email" placeholder="EMAIL" className="w-full bg-black p-4 rounded-2xl outline-none border border-white/5 focus:border-red-500" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="w-full bg-black p-4 rounded-2xl outline-none border border-white/5 focus:border-red-500" value={password} onChange={e => setPassword(e.target.value)} required />
          
          <button disabled={loading} className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase shadow-lg shadow-red-600/20 active:scale-95 transition-all">
            {loading ? 'WAITING...' : (isSignUp ? 'CREATE ACCOUNT' : 'LOGIN')}
          </button>
        </form>
        
        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center mt-6 text-white/30 hover:text-white font-bold text-xs uppercase tracking-widest">
          {isSignUp ? 'Already have an account? Login' : 'New here? Create Account'}
        </button>
      </motion.div>
    </div>
  );
};