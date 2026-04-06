import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Send, Search, Candy } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export const Transfer = () => {
  const { user, balance, removeBet } = useWallet();
  const [targetUser, setTargetUser] = useState('');
  const [amount, setAmount] = useState(1000);
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    if (amount > balance) return setStatus("Not enough Candy!");
    if (amount <= 0) return setStatus("Invalid amount!");
    if (targetUser.toLowerCase() === user.username.toLowerCase()) return setStatus("Can't send to yourself!");

    setStatus('Verifying user...');
    
    // 1. Find the user
    const { data: target, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', targetUser.toLowerCase())
      .single();

    if (findError || !target) return setStatus('User not found!');

    setStatus('Sending Candy...');

    // 2. Remove from your balance
    removeBet(amount);
    
    // 3. Add to their balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: target.balance + amount })
      .eq('id', target.id);

    if (updateError) {
      setStatus('Transfer failed.');
    } else {
      setStatus(`Successfully sent $${amount.toLocaleString()} to ${target.username}!`);
      setTargetUser('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/20 text-white">
          <Send size={24} />
        </div>
        <h2 className="text-3xl font-black italic uppercase italic tracking-tighter">Transfer</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="PLAYER USERNAME" 
            className="w-full bg-black p-5 pl-12 rounded-2xl border border-white/10 font-bold outline-none focus:border-red-500 uppercase text-white"
            value={targetUser}
            onChange={e => setTargetUser(e.target.value)}
          />
        </div>

        <div className="relative">
          <Candy className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
          <input 
            type="number" 
            placeholder="AMOUNT" 
            className="w-full bg-black p-5 pl-12 rounded-2xl border border-white/10 font-black text-2xl outline-none focus:border-red-500 text-white"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
        </div>

        <button 
          onClick={handleTransfer} 
          className="w-full bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-red-500 transition-all uppercase italic shadow-xl active:scale-95"
        >
          Send Candy
        </button>

        {status && (
          <p className="text-center font-black text-red-500 uppercase text-xs tracking-widest mt-4 animate-pulse">
            {status}
          </p>
        )}
      </div>
    </motion.div>
  );
};