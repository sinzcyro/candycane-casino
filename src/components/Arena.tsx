import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { Sword, Shield, Heart, Zap, User, Swords, X } from 'lucide-react';

export const Arena = () => {
  const { user, balance, removeBet, addWin, stats } = useWallet();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [bet, setBet] = useState(1000);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isFighting, setIsFighting] = useState(false);

  useEffect(() => {
    fetchChallenges();
    const channel = supabase.channel('pvp_room').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'pvp_challenges' }, fetchChallenges).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchChallenges = async () => {
    const { data } = await supabase.from('pvp_challenges').select('*').eq('status', 'waiting').order('created_at', { ascending: false });
    if (data) setChallenges(data);
  };

  const createChallenge = async () => {
    if (balance < bet || bet <= 0) return alert("Check wager!");
    removeBet(bet);
    await supabase.from('pvp_challenges').insert([{ challenger_id: user.id, challenger_username: user.username, bet_amount: bet, status: 'waiting' }]);
  };

  const cancelDuel = async (id: string, amount: number) => {
    const { error } = await supabase.from('pvp_challenges').delete().eq('id', id).eq('challenger_id', user.id);
    if (!error) {
        addWin(amount);
        fetchChallenges();
    }
  };

  const startFight = async (challenge: any) => {
    if (balance < challenge.bet_amount) return alert("Broke!");
    removeBet(challenge.bet_amount);
    setIsFighting(true);
    setBattleLog(["BATTLE START!", `POT: $${(challenge.bet_amount * 2).toLocaleString()}`]);
    
    setTimeout(async () => {
        const myPower = stats.attack + (Math.random() * 50);
        const enemyPower = 30 + (Math.random() * 50);
        const won = myPower > enemyPower;

        if (won) {
            setBattleLog(prev => [...prev, "CRITICAL HIT!", "YOU WON!"]);
            addWin(challenge.bet_amount * 2);
        } else {
            setBattleLog(prev => [...prev, "KNOCKED OUT!", "YOU LOST..."]);
        }
        await supabase.from('pvp_challenges').delete().eq('id', challenge.id);
        setTimeout(() => { setIsFighting(false); setBattleLog([]); }, 3000);
    }, 2000);
  };

  if (isFighting) return (
    <div className="bg-[#0f0202] p-12 rounded-[3rem] text-center border-4 border-red-600 shadow-2xl max-w-2xl mx-auto">
        <Swords className="mx-auto mb-6 text-red-600 animate-bounce" size={64} />
        <h2 className="text-4xl font-black italic mb-8 uppercase text-white">DUELING...</h2>
        <div className="space-y-3">{battleLog.map((log, i) => <p key={i} className="text-red-500 font-black uppercase italic">{log}</p>)}</div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a0505] p-5 rounded-3xl border border-white/5 flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-red-600/20 rounded-2xl text-red-500"><Heart size={20}/></div>
            <div><p className="text-[10px] font-bold text-white/30 uppercase">Health</p><p className="font-black text-xl text-white">100/100</p></div>
        </div>
        <div className="bg-[#1a0505] p-5 rounded-3xl border border-white/5 flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-orange-600/20 rounded-2xl text-orange-500"><Sword size={20}/></div>
            <div><p className="text-[10px] font-bold text-white/30 uppercase">Attack</p><p className="font-black text-xl text-white">{stats.attack}</p></div>
        </div>
        <div className="bg-[#1a0505] p-5 rounded-3xl border border-white/5 flex items-center gap-4 shadow-xl">
            <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500"><Shield size={20}/></div>
            <div><p className="text-[10px] font-bold text-white/30 uppercase">Defense</p><p className="font-black text-xl text-white">{stats.defense}</p></div>
        </div>
      </div>

      <div className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
        <h2 className="text-2xl font-black uppercase italic mb-6">Host a Duel</h2>
        <div className="flex flex-col md:flex-row gap-4">
            <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="flex-1 bg-black p-5 rounded-2xl border border-white/10 font-black text-2xl outline-none" />
            <button onClick={createChallenge} className="bg-red-600 text-white px-12 py-5 rounded-2xl font-black uppercase italic shadow-xl">Post Fight</button>
        </div>
      </div>

      <div className="grid gap-3">
        {challenges.map(c => (
          <div key={c.id} className="bg-[#1a0505] p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-red-500/50 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-white/5"><User className="text-white/20" /></div>
                <div><p className="font-black text-white uppercase italic">{c.challenger_username}</p><p className="text-red-500 font-bold text-sm italic">$ {c.bet_amount.toLocaleString()}</p></div>
            </div>
            {c.challenger_id === user.id ? (
                <button onClick={() => cancelDuel(c.id, c.bet_amount)} className="bg-red-600/20 text-red-500 border border-red-500/50 px-6 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all">
                    <X size={14}/> Cancel Duel
                </button>
            ) : (
                <button onClick={() => startFight(c)} className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase shadow-lg">Accept Fight</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};