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
    const email = `${username.toLowerCase()}@cc.com`;

    try {
      if (isSignUp) {
        const { data, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (data.user) {
          await supabase.from('profiles').upsert([{ 
            id: data.user.id, 
            username: username.toLowerCase(), 
            balance: 5000 
          }]);
          alert("Success! Now please Login.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0202] p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 w-full max-w-md shadow-2xl text-center">
        <img src="/candycane.png" className="h-20 mx-auto mb-8" alt="Logo" />
        <h2 className="text-3xl font-black italic uppercase mb-8">{isSignUp ? 'Join The Jar' : 'Login'}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="text" placeholder="USERNAME" className="w-full bg-black p-4 rounded-2xl outline-none border border-white/10 focus:border-red-600 text-white" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="PASSWORD" className="w-full bg-black p-4 rounded-2xl outline-none border border-white/10 focus:border-red-600 text-white" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-white shadow-lg active:scale-95 transition-all">
            {loading ? 'WAITING...' : (isSignUp ? 'REGISTER' : 'LOG IN')}
          </button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-white/30 hover:text-white font-bold text-xs uppercase tracking-widest block w-full">
          {isSignUp ? 'Back to Login' : 'Need an Account? Sign Up'}
        </button>
      </motion.div>
    </div>
  );
};