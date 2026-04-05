import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Package, Send, Trash2, Sword, Shield } from 'lucide-react';

export const Inventory = () => {
  const { user, inventory, updateInventory } = useWallet();
  const [targetUser, setTargetUser] = useState('');
  const [status, setStatus] = useState('');

  const giftItem = async (itemIndex: number) => {
    if (!targetUser) return setStatus("Type a username first!");
    const item = inventory[itemIndex];
    
    setStatus('Gifting...');
    // 1. Find the target
    const { data: target } = await supabase.from('profiles').select('*').eq('username', targetUser.toLowerCase()).single();

    if (!target) return setStatus("Player not found!");

    // 2. Remove from my inventory
    const myNewInv = [...inventory];
    myNewInv.splice(itemIndex, 1);
    
    // 3. Add to their inventory
    const targetInv = target.inventory || [];
    const targetNewInv = [...targetInv, item];

    // 4. Update Database
    const { error: err1 } = await supabase.from('profiles').update({ inventory: myNewInv }).eq('id', user.id);
    const { error: err2 } = await supabase.from('profiles').update({ inventory: targetNewInv }).eq('id', target.id);

    if (!err1 && !err2) {
      updateInventory(myNewInv);
      setStatus(`GIFTED ${item.name} TO ${target.username}!`);
      setTargetUser('');
    } else {
      setStatus("Gifting failed.");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
            <Package className="text-red-500" size={32} />
            <h2 className="text-3xl font-black italic uppercase italic">My Vault</h2>
        </div>

        <div className="grid gap-4">
          {inventory.length === 0 ? (
            <p className="text-white/20 text-center py-10 font-bold uppercase tracking-widest border-2 border-dashed border-white/5 rounded-3xl">Your vault is empty...</p>
          ) : (
            inventory.map((item: any, i: number) => (
              <div key={i} className="bg-black/40 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600/20 rounded-xl text-red-500">
                        {item.type === 'weapon' ? <Sword size={20}/> : <Shield size={20}/>}
                    </div>
                    <div>
                        <p className="font-black text-white uppercase italic">{item.name}</p>
                        <p className="text-red-500 font-bold text-xs uppercase">+{item.stat} {item.type === 'weapon' ? 'ATK' : 'DEF'}</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="USERNAME" 
                        className="bg-black border border-white/10 px-4 py-2 rounded-lg text-xs font-bold outline-none focus:border-red-500 w-32 uppercase"
                        value={targetUser}
                        onChange={e => setTargetUser(e.target.value)}
                    />
                    <button onClick={() => giftItem(i)} className="bg-white text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                        <Send size={12}/> Gift
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
        {status && <p className="mt-6 text-center font-black text-red-500 uppercase text-xs animate-pulse">{status}</p>}
      </div>
    </div>
  );
};