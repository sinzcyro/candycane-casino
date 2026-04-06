import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { Sword, Shield, FlaskConical, Sparkles, Zap, Flame, Ghost, Diamond, Trophy } from 'lucide-react';

const SHOP_ITEMS = [
  // --- WEAPONS ---
  { id: 'w1', name: 'Wooden Cane', type: 'weapon', price: 5000, stat: 5, icon: <Sword/>, tier: 'Starter' },
  { id: 'w2', name: 'Steel Slasher', type: 'weapon', price: 50000, stat: 20, icon: <Sword/>, tier: 'Common' },
  { id: 'w3', name: 'Ruby Reaper', type: 'weapon', price: 250000, stat: 60, icon: <Flame className="text-red-500"/>, tier: 'Rare' },
  { id: 'w4', name: 'Candy Katana', type: 'weapon', price: 750000, stat: 110, icon: <Sword className="text-rose-400"/>, tier: 'Epic' },
  { id: 'w5', name: 'Diamond Destroyer', type: 'weapon', price: 2500000, stat: 250, icon: <Diamond className="text-cyan-400"/>, tier: 'Legendary' },
  { id: 'w6', name: 'CANE SCYTHE', type: 'weapon', price: 10000000, stat: 800, icon: <Trophy className="text-red-600"/>, tier: 'Mastermind' },
  { id: 'w7', name: 'VOID BRINGER', type: 'weapon', price: 50000000, stat: 2500, icon: <Ghost className="text-purple-600"/>, tier: 'God-Tier' },

  // --- ARMOR ---
  { id: 'a1', name: 'Sugar Wrap', type: 'armor', price: 5000, stat: 5, icon: <Shield/>, tier: 'Starter' },
  { id: 'a2', name: 'Hardened Caramel', type: 'armor', price: 40000, stat: 15, icon: <Shield/>, tier: 'Common' },
  { id: 'a3', name: 'Sugar Plate', type: 'armor', price: 150000, stat: 45, icon: <Shield className="text-pink-300"/>, tier: 'Rare' },
  { id: 'a4', name: 'Candy Shell', type: 'armor', price: 600000, stat: 120, icon: <Shield className="text-red-500"/>, tier: 'Epic' },
  { id: 'a5', name: 'Emerald Guard', type: 'armor', price: 3000000, stat: 400, icon: <Shield className="text-emerald-500"/>, tier: 'Legendary' },
  { id: 'a6', name: 'GODS HEART', type: 'armor', price: 20000000, stat: 1500, icon: <Shield className="text-white"/>, tier: 'God-Tier' },

  // --- SPECIALS / POTIONS ---
  { id: 'p1', name: 'Red Glow', type: 'special', price: 100000, stat: 0, icon: <Zap className="text-red-500"/>, tier: 'Cosmetic' },
  { id: 'h1', name: 'Cherry Juice', type: 'potion', price: 5000, stat: 100, icon: <FlaskConical className="text-red-400"/>, tier: 'Heal' },
  { id: 'h2', name: 'Soul Essence', type: 'potion', price: 50000, stat: 500, icon: <Sparkles className="text-blue-400"/>, tier: 'Mega Heal' },
];

export const CandyShop = () => {
  const { balance, inventory, updateInventory, removeBet, stats, updateStats } = useWallet();

  const buy = (item: any) => {
    if (balance < item.price) return alert("Not enough Candy!");
    const owned = inventory.find((i: any) => i.id === item.id);
    if (owned && (item.type !== 'potion')) return alert("Already owned!");

    removeBet(item.price);
    
    if (item.type === 'potion') {
        updateStats({ hp: Math.min(stats.maxHp, stats.hp + item.stat) });
        alert(`Used ${item.name}!`);
    } else {
        updateInventory([...inventory, item]);
        const statKey = item.type === 'weapon' ? 'attack' : 'defense';
        updateStats({ [statKey]: stats[statKey] + item.stat });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {SHOP_ITEMS.map(item => {
        const owned = inventory.find((i: any) => i.id === item.id);
        return (
          <motion.div key={item.id} whileHover={{ y: -8 }} className="bg-[#1a0505] p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-between h-80 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-red-500 group-hover:scale-110 transition-transform">{item.icon}</div>
              <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${owned ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-600/10 text-red-500/50'}`}>
                {item.tier}
              </span>
            </div>
            
            <div className="relative z-10 mt-4">
              <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-tight">{item.name}</h3>
              <p className="text-red-500 font-bold text-xs mt-1">
                {item.stat > 0 ? `+${item.stat.toLocaleString()} ${item.type.toUpperCase()}` : 'COSMETIC EFFECT'}
              </p>
            </div>

            <button 
              onClick={() => buy(item)} 
              disabled={owned && item.type !== 'potion'} 
              className={`relative z-10 w-full py-4 mt-4 rounded-xl font-black transition-all uppercase italic text-sm ${owned && item.type !== 'potion' ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-xl'}`}
            >
              {owned && item.type !== 'potion' ? 'OWNED' : `$${item.price.toLocaleString()}`}
            </button>

            {/* Background Flair */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all" />
          </motion.div>
        );
      })}
    </div>
  );
};