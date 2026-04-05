import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { ShoppingBag, Check } from 'lucide-react';

const ITEMS = [
  { id: 'red-glow', name: 'CRIMSON GLOW', desc: 'Adds a red glow to your balance', price: 50000 },
  { id: 'cane-badge', name: 'LEGENDARY CANE', desc: 'Badge next to your name', price: 100000 },
];

export const Shop = () => {
  const { buyItem, inventory } = useWallet();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5">
      <div className="flex items-center gap-4 mb-8">
        <ShoppingBag className="text-red-500" size={32} />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Candy Shop</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {ITEMS.map(item => (
          <div key={item.id} className="bg-black/20 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between h-56">
            <div>
              <h3 className="font-black text-xl italic uppercase tracking-tighter text-red-500">{item.name}</h3>
              <p className="text-white/40 text-sm mt-1">{item.desc}</p>
            </div>
            <button 
              onClick={() => buyItem(item.id, item.price)}
              disabled={inventory.includes(item.id)}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${inventory.includes(item.id) ? 'bg-white/10 text-white/20' : 'bg-red-600 hover:bg-red-500'}`}
            >
              {inventory.includes(item.id) ? <span className="flex items-center justify-center gap-2"><Check size={16}/> OWNED</span> : `BUY FOR $${item.price.toLocaleString()}`}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};