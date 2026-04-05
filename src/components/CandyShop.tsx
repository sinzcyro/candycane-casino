import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { Sword, Shield, FlaskConical, Sparkles } from 'lucide-react';

const SHOP_ITEMS = [
  // WEAPONS
  { id: 'wood_sword', name: 'Wooden Cane', type: 'weapon', price: 5000, stat: 5, icon: <Sword/> },
  { id: 'steel_sword', name: 'Steel Slasher', type: 'weapon', price: 50000, stat: 20, icon: <Sword/> },
  { id: 'ruby_reaper', name: 'Ruby Reaper', type: 'weapon', price: 250000, stat: 60, icon: <Sword className="text-red-400"/> },
  { id: 'diamond_destroyer', name: 'Diamond Destroyer', type: 'weapon', price: 1000000, stat: 150, icon: <Sword className="text-cyan-400"/> },
  { id: 'candy_blade', name: 'Legendary Candy Blade', type: 'weapon', price: 5000000, stat: 400, icon: <Sparkles className="text-red-500"/> },
  { id: 'cane_scythe', name: 'CANE SCYTHE (OWNER TIER)', type: 'weapon', price: 25000000, stat: 1200, icon: <Sword className="text-white fill-red-600"/> },

  // ARMOR
  { id: 'leather_armor', name: 'Sugar Wrap', type: 'armor', price: 5000, stat: 5, icon: <Shield/> },
  { id: 'sugar_plate', name: 'Sugar Plated Vest', type: 'armor', price: 100000, stat: 45, icon: <Shield className="text-pink-300"/> },
  { id: 'candy_armor', name: 'Hard Shell Armor', type: 'armor', price: 500000, stat: 120, icon: <Shield className="text-red-500"/> },
  { id: 'caramel_plate', name: 'Eternal Caramel Plate', type: 'armor', price: 2000000, stat: 350, icon: <Shield className="text-amber-600"/> },
  { id: 'god_shell', name: 'DIAMOND CANDY SHELL', type: 'armor', price: 15000000, stat: 1000, icon: <Shield className="text-cyan-500"/> },

  // POTIONS
  { id: 'heal_potion', name: 'Cherry Juice (Full Heal)', type: 'potion', price: 2000, stat: 100, icon: <FlaskConical className="text-red-400"/> },
];

export const CandyShop = () => {
  const { balance, inventory, updateInventory, removeBet, stats, updateStats } = useWallet();

  const buy = (item: any) => {
    if (balance < item.price) return alert("You need more Candy for this!");
    const alreadyOwned = inventory.find((i: any) => i.id === item.id);
    if (alreadyOwned && item.type !== 'potion') return alert("You already own this!");

    removeBet(item.price);
    
    if (item.type === 'potion') {
        updateStats({ hp: stats.maxHp });
    } else {
        updateInventory([...inventory, item]);
        const statKey = item.type === 'weapon' ? 'attack' : 'defense';
        updateStats({ [statKey]: stats[statKey] + item.stat });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {SHOP_ITEMS.map(item => {
        const owned = inventory.find((i: any) => i.id === item.id);
        return (
          <motion.div key={item.id} whileHover={{ y: -5 }} className="bg-[#1a0505] p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between h-72 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">{item.icon}</div>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${owned ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white/20'}`}>
                {owned && item.type !== 'potion' ? 'OWNED' : item.type}
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">{item.name}</h3>
              <p className="text-red-500 font-bold text-xs">
                +{item.stat.toLocaleString()} {item.type === 'weapon' ? 'ATTACK' : item.type === 'armor' ? 'DEFENSE' : 'HP'}
              </p>
            </div>
            <button 
              onClick={() => buy(item)} 
              disabled={owned && item.type !== 'potion'} 
              className={`relative z-10 w-full py-4 rounded-xl font-black transition-all uppercase italic text-sm ${owned && item.type !== 'potion' ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-lg'}`}
            >
              {owned && item.type !== 'potion' ? 'EQUIPPED' : `$${item.price.toLocaleString()}`}
            </button>
            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        );
      })}
    </div>
  );
};