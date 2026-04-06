import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { Map, Compass, Sparkles, Box } from 'lucide-react';

const LOOT_TABLE = [
  { name: 'Rusty Blade', type: 'weapon', stat: 3, price: 1000, chance: 0.5 },
  { name: 'Broken Shield', type: 'armor', stat: 2, price: 800, chance: 0.3 },
  { name: 'Sharpened Cane', type: 'weapon', stat: 12, price: 15000, chance: 0.15 },
  { name: 'Hardened Sugar', type: 'armor', stat: 10, price: 12000, chance: 0.04 },
  { name: 'MYTHIC CANDY SCYTHE', type: 'weapon', stat: 500, price: 2000000, chance: 0.01 },
];

export const Explore = () => {
  const { lastExplore, exploreWorld } = useWallet();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExploring, setIsExploring] = useState(false);
  const [found, setFound] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = (new Date(lastExplore).getTime() + 60000) - Date.now();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastExplore]);

  const handleExplore = () => {
    setIsExploring(true);
    setFound(null);
    
    setTimeout(() => {
      const rand = Math.random();
      let cumulative = 0;
      let item = LOOT_TABLE[0];
      for (const l of LOOT_TABLE) {
        cumulative += l.chance;
        if (rand < cumulative) { item = l; break; }
      }
      setFound(item);
      exploreWorld(item);
      setIsExploring(false);
    }, 2000);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl max-w-2xl mx-auto">
      <div className="flex justify-center mb-6 text-red-500">
        <Map size={48} className={isExploring ? 'animate-pulse' : ''} />
      </div>
      <h2 className="text-4xl font-black italic uppercase mb-2">Wild Exploration</h2>
      <p className="text-white/40 font-bold text-xs uppercase tracking-widest mb-10 text-center mx-auto max-w-xs">
        Search the candy barrens for lost loot. 1 minute cooldown.
      </p>

      {isExploring ? (
        <div className="py-10 space-y-4">
            <Compass size={64} className="mx-auto text-red-600 animate-spin" />
            <p className="text-red-500 font-black italic animate-bounce">ADVENTURING...</p>
        </div>
      ) : found ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-black/40 p-8 rounded-3xl border-2 border-red-500 mb-8">
            <Sparkles className="mx-auto text-yellow-500 mb-2" />
            <p className="text-xs font-black text-white/40 uppercase">You Found</p>
            <h3 className="text-3xl font-black text-white italic uppercase">{found.name}</h3>
            <button onClick={() => setFound(null)} className="mt-4 text-red-500 font-black text-[10px] uppercase underline">Continue</button>
        </motion.div>
      ) : timeLeft > 0 ? (
        <div className="bg-black/20 p-8 rounded-3xl border border-white/5 inline-block">
            <p className="text-white/20 font-black text-xs mb-1 uppercase">Next Adventure In</p>
            <p className="text-4xl font-black text-white tracking-tighter">{timeLeft}s</p>
        </div>
      ) : (
        <button onClick={handleExplore} className="bg-white text-black font-black px-16 py-6 rounded-2xl text-xl uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-xl">
            Explore Now
        </button>
      )}
    </div>
  );
};