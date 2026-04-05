import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ShieldAlert, UserPlus, Coins, Search } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export const AdminTools = () => {
  const { balance, addWin } = useWallet();
  const [targetUser, setTargetUser] = useState('');
  const [giftAmount, setGiftAmount] = useState(1000);
  const [selfAmount, setSelfAmount] = useState(1000000);
  const [status, setStatus] = useState('');

  const addMoneyToSelf = async () => {
    addWin(selfAmount);
    setStatus(`Added $${selfAmount.toLocaleString()} to your balance!`);
    setTimeout(() => setStatus(''), 3000);
  };

  const giftToUser = async () => {
    setStatus('Searching for user...');
    
    // 1. Find the user by username
    const { data: target, error: findError } = await supabase
      .from('profiles')
      .select('id, balance, username')
      .eq('username', targetUser.toLowerCase())
      .single();

    if (findError || !target) {
      setStatus('User not found!');
      return;
    }

    // 2. Update their balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: target.balance + giftAmount })
      .eq('id', target.id);

    if (updateError) {
      setStatus('Error updating user!');
    } else {
      setStatus(`Sent $${giftAmount.toLocaleString()} to ${target.username}!`);
      setTargetUser('');
    }
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a0505] p-8 rounded-[3rem] border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/40">
          <ShieldAlert className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Owner Controls</h2>
          <p className="text-red-500/60 text-[10px] font-black tracking-widest uppercase">Authorized Access Only</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ADD TO SELF */}
        <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-white/40 font-black text-xs uppercase tracking-widest">
            <Coins size={14}/> Print Money (Self)
          </div>
          <input 
            type="number" 
            value={selfAmount} 
            onChange={e => setSelfAmount(Number(e.target.value))}
            className="w-full bg-black border border-white/10 p-4 rounded-xl font-black text-xl outline-none focus:border-red-500" 
          />
          <button onClick={addMoneyToSelf} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase italic">
            Add To My Wallet
          </button>
        </div>

        {/* GIVE TO OTHERS */}
        <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-white/40 font-black text-xs uppercase tracking-widest">
            <UserPlus size={14}/> Send To Player
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16}/>
            <input 
              type="text" 
              placeholder="TARGET USERNAME" 
              value={targetUser}
              onChange={e => setTargetUser(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 pl-12 rounded-xl font-bold outline-none focus:border-red-500 uppercase" 
            />
          </div>
          <input 
            type="number" 
            placeholder="AMOUNT" 
            value={giftAmount}
            onChange={e => setGiftAmount(Number(e.target.value))}
            className="w-full bg-black border border-white/10 p-4 rounded-xl font-black text-xl outline-none focus:border-red-500" 
          />
          <button onClick={giftToUser} className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all uppercase italic">
            Send Candy
          </button>
        </div>
      </div>

      {status && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-4 bg-red-600/10 border border-red-500/20 rounded-xl text-center font-bold text-red-500 uppercase text-sm tracking-widest">
          {status}
        </motion.div>
      )}
    </motion.div>
  );
};