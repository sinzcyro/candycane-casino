import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { secureRandom } from '../utils/crypto'; // Fixed: Added missing import
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronUp, AlertTriangle } from 'lucide-react';

export const Tower = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [level, setLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [betAmount, setBetAmount] = useState(100);

  const multipliers = [1.2, 1.8, 2.5, 3.8, 5.2, 8.0, 12.0, 20.0];

  const play = () => {
    if (isGameOver) {
      // Reset if game was over
      setIsGameOver(false);
      setLevel(0);
    }

    if (!isPlaying) {
      if (balance < betAmount) return alert("Not enough coins!");
      removeBet(betAmount);
      setIsPlaying(true);
    }

    // CSPRNG Logic: 65% chance to succeed
    const isSafe = secureRandom() > 0.35;

    if (isSafe) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      
      // If reached the top
      if (nextLevel === multipliers.length) {
        cashout(nextLevel);
      }
    } else {
      // LOST
      setIsGameOver(true);
      setIsPlaying(false);
    }
  };

  const cashout = (finalLevel = level) => {
    if (finalLevel === 0) return;
    const win = Math.floor(betAmount * multipliers[finalLevel - 1]);
    addWin(win);
    setLevel(0);
    setIsPlaying(false);
    setIsGameOver(false);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3.5rem] border border-white/5 text-center max-w-md mx-auto shadow-2xl">
      <div className="flex items-center justify-center gap-2 mb-8 text-red-500">
        <Layers size={24} />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Stack Tower</h2>
      </div>

      <div className="flex flex-col-reverse gap-2 mb-8">
        {multipliers.map((m, i) => (
          <motion.div 
            key={i}
            initial={false}
            animate={{ 
              scale: level === i + 1 ? 1.05 : 1,
              backgroundColor: level > i ? '#dc2626' : (isGameOver && level === i ? '#450a0a' : '#0a0b0d'),
              borderColor: level === i ? '#ef4444' : 'rgba(255,255,255,0.05)'
            }}
            className={`h-12 rounded-2xl border flex items-center justify-between px-6 transition-colors duration-300`}
          >
            <span className={`text-xs font-black ${level > i ? 'text-white' : 'text-white/20'}`}>LEVEL {i + 1}</span>
            <span className={`font-black ${level > i ? 'text-white' : 'text-white/20'}`}>{m}x</span>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {!isPlaying && !isGameOver && (
           <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-4">
             <p className="text-[10px] font-black text-white/20 uppercase mb-1">Wager</p>
             <input 
               type="number" 
               value={betAmount} 
               onChange={(e) => setBetAmount(Number(e.target.value))}
               className="w-full bg-transparent text-center font-black text-2xl outline-none"
             />
           </div>
        )}

        {isGameOver && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-4 bg-red-600/20 border border-red-600/50 rounded-2xl mb-4 flex items-center justify-center gap-2 text-red-500 font-black uppercase italic">
            <AlertTriangle size={18} /> Crushed!
          </motion.div>
        )}

        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={play}
            className="flex-[2] bg-white text-black font-black py-5 rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 uppercase italic"
          >
            <ChevronUp size={20} />
            {isPlaying ? 'Stack Up' : (isGameOver ? 'Try Again' : 'Start Game')}
          </motion.button>

          {isPlaying && level > 0 && (
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => cashout()}
              className="flex-1 bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl uppercase italic text-xs"
            >
              Cash ${(betAmount * multipliers[level - 1]).toFixed(0)}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};