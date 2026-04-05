import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ShieldAlert, UserPlus, Coins, Search, Zap, Plus, Minus } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export const AdminPanel = () => {
  const { balance, setExactBalance } = useWallet();
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState(1000000);
  const [status, setStatus] = useState('');

  const handleSelfUpdate = (mode: 'add' | 'set') => {
    const newBal = mode === 'add' ? balance + amount : amount;
    setExactBalance(newBal);
    setStatus(`Updated your balance to $${newBal.toLocaleString()}`);
    setTimeout(() => setStatus(''), 3000);
  };

  const handleUserUpdate = async (mode: 'give' | 'take' | 'set') => {
    setStatus('Searching player...');
    const { data: target } = await supabase.from('profiles').select('*').eq('username', targetUser.toLowerCase()).single();

    if (!target) {
        setStatus('Player not found!');
        return;
    }

    let newBal = target.balance;
    if (mode === 'give') newBal += amount;
    if (mode === 'take') newBal = Math.max(0, target.balance - amount);
    if (mode === 'set') newBal = amount;

    const { error } = await supabase.from('profiles').update({ balance: newBal }).eq('id', target.id);
    
    if (error) setStatus('Database Error');
    else setStatus(`Updated ${target.username} to $${newBal.toLocaleString()}`);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      <div className="bg-[#1a0505] p-8 rounded-[3rem] border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
        <div className="flex items-center gap-4 mb-10">
          <ShieldAlert className="text-red-500" size={40} />
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Owner Controls</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5">
            <h3 className="font-black text-red-500 flex items-center gap-2 uppercase tracking-widest text-[10px]">
               <Zap size={14}/> Your Balance
            </h3>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-black p-4 rounded-xl border border-white/10 font-black text-2xl outline-none focus:border-red-500 text-white"/>
            <div className="flex gap-2">
                <button onClick={() => handleSelfUpdate('add')} className="flex-1 bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500 transition-colors"> <Plus size={18}/> ADD</button>
                <button onClick={() => handleSelfUpdate('set')} className="flex-1 bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"> <Coins size={18}/> SET</button>
            </div>
          </div>

          <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5">
            <h3 className="font-black text-red-500 flex items-center gap-2 uppercase tracking-widest text-[10px]">
               <UserPlus size={14}/> Manage Player
            </h3>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
                <input type="text" placeholder="USERNAME" value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full bg-black pl-12 p-4 rounded-xl border border-white/10 font-bold outline-none uppercase focus:border-red-500 text-white"/>
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleUserUpdate('give')} className="flex-1 bg-red-600 text-white font-black py-4 rounded-xl"> GIVE</button>
                <button onClick={() => handleUserUpdate('take')} className="flex-1 bg-zinc-800 text-white font-black py-4 rounded-xl"> TAKE</button>
            </div>
          </div>
        </div>

        {status && <p className="mt-8 text-center font-black text-red-500 animate-pulse uppercase tracking-widest text-sm">{status}</p>}
      </div>
    </motion.div>
  );
};