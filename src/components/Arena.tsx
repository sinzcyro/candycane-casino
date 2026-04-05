import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { Sword, Shield, Heart, Zap, User, Swords } from 'lucide-react';

export const Arena = () => {
  const { user, balance, removeBet, addWin, stats } = useWallet();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [bet, setBet] = useState(1000);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isFighting, setIsFighting] = useState(false);

  useEffect(() => {
    fetchChallenges();

    // FIXED: Added schema: 'public' to satisfy TypeScript
    const channel = supabase.channel('pvp_room')
      .on(
        'postgres_changes' as any, 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pvp_challenges' 
        }, 
        () => {
          fetchChallenges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('pvp_challenges')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });
    
    if (data) setChallenges(data);
  };

  const createChallenge = async () => {
    if (balance < bet || bet <= 0) return alert("Check your wager!");
    removeBet(bet);
    
    const { error } = await supabase.from('pvp_challenges').insert([{ 
        challenger_id: user.id, 
        challenger_username: user.username, 
        bet_amount: bet,
        status: 'waiting'
    }]);

    if (error) {
        alert("Failed to host duel!");
        addWin(bet); // Refund
    }
  };

  const startFight = async (challenge: any) => {
    if (balance < challenge.bet_amount) return alert("Not enough Candy!");
    removeBet(challenge.bet_amount);
    setIsFighting(true);
    
    setBattleLog(["BATTLE INITIATED!", `Total Pot: $${(challenge.bet_amount * 2).toLocaleString()}`]);
    
    setTimeout(async () => {
        // RPG Battle Simulation
        // Your ATK vs Generic Opponent DEF (Higher ATK = better chance)
        const myPower = stats.attack + (Math.random() * 20);
        const enemyPower = 15 + (Math.random() * 20); // Average bot power

        const won = myPower > enemyPower;

        if (won) {
            setBattleLog(prev => [...prev, "⚔️ CRITICAL STRIKE!", "🏆 YOU WON THE DUEL!"]);
            addWin(challenge.bet_amount * 2);
        } else {
            setBattleLog(prev => [...prev, "💥 BLOCKED!", "💀 YOU WERE DEFEATED..."]);
        }

        // Cleanup: Remove the challenge from the board
        await supabase.from('pvp_challenges').delete().eq('id', challenge.id);
        
        setTimeout(() => { 
            setIsFighting(false); 
            setBattleLog([]); 
        }, 4000);
    }, 2000);
  };

  if (isFighting) return (
    <div className="bg-[#0f0202] p-12 rounded-[3rem] text-center border-4 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.3)] max-w-2xl mx-auto">
        <Swords className="mx-auto mb-6 text-red-600 animate-spin-slow" size={64} />
        <h2 className="text-5xl font-black italic mb-8 uppercase text-white tracking-tighter">DUELING...</h2>
        <div className="space-y-3">
            {battleLog.map((log, i) => (
                <motion.p 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={i} 
                    className="text-red-500 font-black uppercase tracking-widest text-lg"
                >
                    {log}
                </motion.p>
            ))}
        </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* RPG STATS PANEL */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox icon={<Heart className="text-red-500"/>} label="Health" val={`${stats.hp}/${stats.maxHp}`} />
        <StatBox icon={<Sword className="text-orange-500"/>} label="Attack" val={stats.attack} />
        <StatBox icon={<Shield className="text-blue-500"/>} label="Defense" val={stats.defense} />
      </div>

      <div className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-600 p-2 rounded-xl"><Zap size={20}/></div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Host a Duel</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-black p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-white/20 uppercase mb-1">Your Wager</p>
                <input 
                    type="number" 
                    value={bet} 
                    onChange={e => setBet(Number(e.target.value))} 
                    className="w-full bg-transparent font-black text-2xl outline-none text-red-500" 
                />
            </div>
            <button 
                onClick={createChallenge} 
                className="bg-white text-black px-12 py-4 rounded-2xl font-black uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-xl"
            >
                Host Fight
            </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white/30 px-2">
            <User size={14} />
            <h3 className="font-black uppercase tracking-widest text-[10px]">Open Challenges</h3>
        </div>
        
        <div className="grid gap-3">
            {challenges.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-white/20 font-bold uppercase text-xs tracking-widest">No fighters in the lobby...</p>
                </div>
            ) : (
                challenges.map(c => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={c.id} 
                        className="bg-[#1a0505] p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-red-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-white/5">
                                <User className="text-white/20" />
                            </div>
                            <div>
                                <p className="font-black text-white uppercase italic text-lg">{c.challenger_username}</p>
                                <p className="text-red-500 font-bold text-sm tracking-tighter italic">WAGERING ${c.bet_amount.toLocaleString()}</p>
                            </div>
                        </div>
                        {c.challenger_id !== user.id ? (
                            <button 
                                onClick={() => startFight(c)} 
                                className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                            >
                                Accept Duel
                            </button>
                        ) : (
                            <span className="text-white/20 font-black text-[10px] uppercase border border-white/5 px-4 py-2 rounded-lg">Your Challenge</span>
                        )}
                    </motion.div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, val }: any) => (
    <div className="bg-[#1a0505] p-5 rounded-3xl border border-white/5 flex items-center gap-4 shadow-xl">
        <div className="p-3 bg-black/40 rounded-2xl">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
            <p className="font-black text-xl text-white tracking-tighter">{val}</p>
        </div>
    </div>
);