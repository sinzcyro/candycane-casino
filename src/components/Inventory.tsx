import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Package, Send, Sword, Shield, DollarSign } from 'lucide-react';

export const Inventory = () => {
  const { user, inventory, sellItem } = useWallet();
  const [targetUser, setTargetUser] = useState('');
  const [status, setStatus] = useState('');

  const handleSell = (i: number, item: any) => {
    const sellPrice = Math.floor(item.price * 0.7);
    sellItem(i, sellPrice);
    setStatus(`SOLD ${item.name} FOR $${sellPrice.toLocaleString()}`);
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4 mb-8"><Package className="text-red-500" size={32} /><h2 className="text-3xl font-black italic uppercase">My Vault</h2></div>
        
        <div className="grid gap-3">
          {inventory.map((item: any, i: number) => (
            <div key={i} className="bg-black/40 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-red-600/10 rounded-xl text-red-500">{item.type === 'weapon' ? <Sword size={20}/> : <Shield size={20}/>}</div>
                <div>
                    <p className="font-black text-white uppercase italic leading-none mb-1">{item.name}</p>
                    <p className="text-red-500 font-bold text-[10px] uppercase">+{item.stat} {item.type === 'weapon' ? 'ATK' : 'DEF'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => handleSell(i, item)} className="bg-emerald-600/20 text-emerald-500 px-4 py-2 rounded-lg font-black text-[10px] uppercase flex items-center gap-1 hover:bg-emerald-600 hover:text-white transition-all">
                    <DollarSign size={12}/> Sell (${Math.floor(item.price * 0.7).toLocaleString()})
                </button>
                <div className="h-8 w-[1px] bg-white/5 mx-1" />
                <input type="text" placeholder="GIFT TO..." className="bg-black border border-white/10 px-3 py-2 rounded-lg text-[10px] font-bold outline-none focus:border-red-500 w-24 uppercase" value={targetUser} onChange={e => setTargetUser(e.target.value)}/>
                <button className="bg-white text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase">Send</button>
              </div>
            </div>
          ))}
        </div>
        {status && <p className="mt-6 text-center font-black text-red-500 uppercase text-xs animate-pulse">{status}</p>}
      </div>
    </div>
  );
};