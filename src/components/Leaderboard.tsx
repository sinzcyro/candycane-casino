import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase.from('profiles').select('*').order('balance', { ascending: false }).limit(10);
      if (data) setLeaders(data);
    };
    fetchLeaders();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="text-red-500" size={32} />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Global Elites</h2>
      </div>
      <div className="space-y-3">
        {leaders.map((u, i) => (
          <div key={u.id} className={`flex items-center justify-between p-5 rounded-2xl ${u.username === 'cane' ? 'bg-red-600/20 border-red-500 border-2' : 'bg-black/20 border-white/5 border'}`}>
            <div className="flex items-center gap-4">
              <span className="font-black text-white/20 w-4">{i + 1}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{u.username}</span>
                {(u.username === 'cane' || u.is_owner) && (
                  <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-lg shadow-red-600/40">
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