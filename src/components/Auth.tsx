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
    if (loading) return;
    setLoading(true);
    
    const cleanUser = username.toLowerCase().trim();
    const email = `${cleanUser}@cc.com`;

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert([{ 
            id: data.user.id, 
            username: cleanUser, 
            balance: 5000, 
            is_owner: cleanUser === 'cane' 
          }]);
          alert("Account Created! You can now Login.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      alert("CANDYCANE ERROR: " + err.message);
    } finally {
      setLoading(false); // RECOVERY: Button resets even if it fails
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0202] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 w-full max-w-md shadow-2xl text-center">
        <img src="/candycane.png" className="h-20 mx-auto mb-8" alt="Logo" />
        <h2 className="text-4xl font-black italic uppercase mb-10 tracking-tighter text-white">
          {isSignUp ? 'REGISTER' : 'LOGIN'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="text" placeholder="USERNAME" className="w-full bg-black p-5 rounded-2xl outline-none border border-white/10 focus:border-red-600 font-bold uppercase text-white" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="w-full bg-black p-5 rounded-2xl outline-none border border-white/10 focus:border-red-600 font-bold text-white" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-red-500 transition-all text-white text-lg">
            {loading ? '...' : (isSignUp ? 'JOIN NOW' : 'LET\'S ROLL')}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-8 text-white/30 hover:text-white font-black text-xs uppercase block w-full">
          {isSignUp ? 'Back to Login' : 'Need an Account? Sign Up'}
        </button>
      </motion.div>
    </div>
  );
};