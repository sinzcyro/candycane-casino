import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Send, Search } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export const Transfer = () => {
  const { balance, removeBet } = useWallet();
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState(1000);
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    if (amount > balance) return setStatus("Insufficient Candy!");
    if (amount <= 0) return;
    
    setStatus('Sending...');
    const { data: target } = await supabase.from('profiles').select('*').eq('username', targetUser.toLowerCase()).single();

    if (!target) return setStatus('User not found!');
    if (target.username === (window as any).currentUsername) return setStatus("Can't send to yourself!");

    // 1. Take from sender
    removeBet(amount);
    
    // 2. Give to receiver
    const { error } = await supabase.from('profiles').update({ balance: target.balance + amount }).eq('id', target.id);

    if (error) setStatus('Transfer Failed');
    else {
      setStatus(`Sent $${amount.toLocaleString()} to ${target.username}!`);
      setTargetUser('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-600 p-3 rounded-2xl"><Send size={24} /></div>
        <h2 className="text-2xl font-black italic uppercase italic">Transfer Candy</h2>
      </div>
      <div className="space-y-4">
        <input type="text" placeholder="RECIPIENT USERNAME" value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full bg-black p-4 rounded-xl border border-white/10 font-bold outline-none focus:border-red-500 uppercase"/>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-black p-4 rounded-xl border border-white/10 font-black text-xl outline-none focus:border-red-500"/>
        <button onClick={handleTransfer} className="w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-red-500 transition-all uppercase italic">Send Now</button>
        {status && <p className="text-center font-black text-red-500 uppercase text-xs tracking-widest">{status}</p>}
      </div>
    </motion.div>
  );
};