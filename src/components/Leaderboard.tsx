import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

const LEADERS = [
  { name: "SugarKing", balance: 2540000, color: "text-yellow-500" },
  { name: "Wagdi", balance: 1250000, color: "text-zinc-400" },
  { name: "CandyCane_PRO", balance: 850000, color: "text-amber-700" },
  { name: "SweetWinner", balance: 120000, color: "text-white/40" },
];

export const Leaderboard = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
    <div className="flex items-center gap-4 mb-8">
      <Trophy className="text-red-500" size={32} />
      <h2 className="text-3xl font-black italic uppercase tracking-tighter">Hall of Fame</h2>
    </div>
    <div className="space-y-3">
      {LEADERS.map((u, i) => (
        <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-black/20 border border-white/5">
          <div className="flex items-center gap-4">
            <Medal className={u.color} />
            <span className="font-bold text-lg">{u.name}</span>
          </div>
          <span className="font-black text-red-500">${u.balance.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </motion.div>
);