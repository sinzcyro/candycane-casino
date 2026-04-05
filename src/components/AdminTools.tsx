import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ShieldAlert, UserPlus, Coins, Search, Zap } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export const AdminTools = () => {
  const { setExactBalance } = useWallet();
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState(100000);
  const [status, setStatus] = useState('');

  const handleSelfUpdate = (mode: 'add' | 'set') => {
    const current = mode === 'add' ? (window as any).currentBalance + amount : amount;
    setExactBalance(amount);
    setStatus(`Updated your balance to $${amount.toLocaleString()}`);
  };

  const handleUserUpdate = async (mode: 'give' | 'take' | 'set') => {
    setStatus('Processing...');
    const { data: target } = await supabase.from('profiles').select('*').eq('username', targetUser.toLowerCase()).single();

    if (!target) {
        setStatus('User not found!');
        return;
    }

    let newBal = target.balance;
    if (mode === 'give') newBal += amount;
    if (mode === 'take') newBal = Math.max(0, target.balance - amount);
    if (mode === 'set') newBal = amount;

    const { error } = await supabase.from('profiles').update({ balance: newBal }).eq('id', target.id);
    
    if (error) setStatus('Error updating player');
    else setStatus(`Successfully updated ${target.username} to $${newBal.toLocaleString()}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <div className="bg-[#1a0505] p-8 rounded-[3rem] border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
        <div className="flex items-center gap-4 mb-10">
          <ShieldAlert className="text-red-500" size={40} />
          <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">Admin Panel</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* SECTION: OWNER WALLET */}
          <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5">
            <h3 className="font-black text-red-500 flex items-center gap-2 uppercase tracking-widest text-xs">
               <Zap size={14}/> Manage Your Wallet
            </h3>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-black p-4 rounded-xl border border-white/10 font-black text-2xl outline-none focus:border-red-500"/>
            <div className="flex gap-2">
                <button onClick={() => setExactBalance(amount)} className="flex-1 bg-white text-black font-black py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase italic">Set My Balance</button>
            </div>
          </div>

          {/* SECTION: MANAGE OTHERS */}
          <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5">
            <h3 className="font-black text-red-500 flex items-center gap-2 uppercase tracking-widest text-xs">
               <UserPlus size={14}/> Manage Other Players
            </h3>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
                <input type="text" placeholder="PLAYER USERNAME" value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full bg-black pl-12 p-4 rounded-xl border border-white/10 font-bold outline-none uppercase focus:border-red-500"/>
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleUserUpdate('give')} className="flex-1 bg-red-600 text-white font-black py-4 rounded-xl">GIVE</button>
                <button onClick={() => handleUserUpdate('take')} className="flex-1 bg-zinc-800 text-white font-black py-4 rounded-xl">TAKE</button>
                <button onClick={() => handleUserUpdate('set')} className="flex-1 bg-white text-black font-black py-4 rounded-xl">SET</button>
            </div>
          </div>
        </div>

        {status && <p className="mt-8 text-center font-black text-red-500 animate-pulse uppercase tracking-widest">{status}</p>}
      </div>
    </motion.div>
  );
};