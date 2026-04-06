import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, balance, is_owner')
        .order('balance', { ascending: false })
        .limit(10);
      
      if (data) setLeaders(data);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="text-red-500" size={32} />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Global Elites</h2>
      </div>

      <div className="space-y-3">
        {loading ? (
            <p className="text-white/20 text-center font-black animate-pulse">FETCHING RANKINGS...</p>
        ) : leaders.map((u, i) => (
          <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border ${u.username?.toLowerCase() === 'cane' ? 'bg-red-600/10 border-red-500' : 'bg-black/20 border-white/5'}`}>
            <div className="flex items-center gap-4">
              <span className="font-black text-white/20 w-4">{i + 1}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white uppercase">{u.username || 'Anonymous'}</span>
                {(u.username?.toLowerCase() === 'cane' || u.is_owner) && (
                  <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <Crown size={10} /> OWNER
                  </span>
                )}
              </div>
            </div>
            <span className="font-black text-red-500 text-xl">${u.balance.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};