import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';
import { Candy } from 'lucide-react';

export const Cups = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [shuffling, setShuffling] = useState(false);
  const [winningCup, setWinningCup] = useState<number | null>(null);
  const [selectedCup, setSelectedCup] = useState<number | null>(null);

  const play = (choice: number) => {
    if (shuffling || balance < bet || bet <= 0) return;
    removeBet(bet);
    setShuffling(true);
    setWinningCup(null);
    setSelectedCup(null);

    // Visual shuffle effect
    setTimeout(() => {
      const win = Math.floor(secureRandom() * 3);
      setWinningCup(win);
      setSelectedCup(choice);
      setShuffling(false);
      if (choice === win) addWin(bet * 3);
    }, 1500);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl">
      <div className="flex justify-center gap-6 mb-16 h-48 items-end">
        {[0, 1, 2].map(i => (
          <motion.div 
            key={i}
            animate={shuffling ? { 
              x: [0, (i === 1 ? 100 : -100), 0],
              y: [0, -20, 0]
            } : { 
              y: winningCup !== null ? -60 : 0 
            }}
            transition={{ repeat: shuffling ? 4 : 0, duration: 0.3 }}
            onClick={() => play(i)}
            className={`w-28 h-36 rounded-t-[4rem] cursor-pointer relative border-b-8 border-red-700 shadow-2xl transition-colors ${
                winningCup === i ? 'bg-white' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {winningCup === i && !shuffling && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-red-500 animate-bounce">
                    <Candy size={32} fill="currentColor"/>
                </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="max-w-sm mx-auto space-y-6">
        <p className="font-black text-white/40 uppercase tracking-widest italic">3x Multiplier - Find the Candy</p>
        <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} disabled={shuffling} className="w-full bg-black border border-white/10 p-5 rounded-2xl font-black text-2xl outline-none text-center"/>
      </div>
    </div>
  );
};