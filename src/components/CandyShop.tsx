import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { Sword, Shield, FlaskConical, Check } from 'lucide-react';

const SHOP_ITEMS = [
  { id: 'wood_sword', name: 'Wooden Cane', type: 'weapon', price: 5000, stat: 5, icon: <Sword/> },
  { id: 'steel_sword', name: 'Steel Slasher', type: 'weapon', price: 50000, stat: 20, icon: <Sword/> },
  { id: 'candy_blade', name: 'Legendary Candy Blade', type: 'weapon', price: 1000000, stat: 100, icon: <Sword className="text-red-500"/> },
  { id: 'leather_armor', name: 'Sugar Wrap', type: 'armor', price: 5000, stat: 5, icon: <Shield/> },
  { id: 'candy_armor', name: 'Hard Shell Armor', type: 'armor', price: 150000, stat: 50, icon: <Shield className="text-red-500"/> },
  { id: 'heal_potion', name: 'Cherry Juice (Full Heal)', type: 'potion', price: 2000, stat: 100, icon: <FlaskConical className="text-red-400"/> },
];

export const CandyShop = () => {
  const { balance, inventory, updateInventory, removeBet, stats, updateStats } = useWallet();

  const buy = (item: any) => {
    if (balance < item.price) return alert("Broke!");
    if (inventory.find((i: any) => i.id === item.id) && item.type !== 'potion') return alert("Owned!");

    removeBet(item.price);
    
    if (item.type === 'potion') {
        updateStats({ hp: stats.maxHp });
        alert("Healed to full!");
    } else {
        updateInventory([...inventory, item]);
        const statKey = item.type === 'weapon' ? 'attack' : 'defense';
        updateStats({ [statKey]: stats[statKey] + item.stat });
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SHOP_ITEMS.map(item => {
        const owned = inventory.find((i: any) => i.id === item.id);
        return (
          <motion.div key={item.id} whileHover={{ y: -5 }} className="bg-[#1a0505] p-6 rounded-[2rem] border border-white/5 flex flex-col justify-between h-64 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-black/40 rounded-2xl text-red-500">{item.icon}</div>
              <span className="text-white/20 font-black text-xs uppercase tracking-widest">{item.type}</span>
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase text-white">{item.name}</h3>
              <p className="text-red-500/60 font-bold text-xs">+{item.stat} {item.type === 'weapon' ? 'ATK' : item.type === 'armor' ? 'DEF' : 'HP'}</p>
            </div>
            <button onClick={() => buy(item)} disabled={owned && item.type !== 'potion'} className={`w-full py-4 rounded-xl font-black transition-all ${owned && item.type !== 'potion' ? 'bg-white/5 text-white/20' : 'bg-red-600 hover:bg-red-500'}`}>
              {owned && item.type !== 'potion' ? 'OWNED' : `$${item.price.toLocaleString()}`}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};