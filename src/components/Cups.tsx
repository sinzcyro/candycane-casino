import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';

export const Cups = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [shuffling, setShuffling] = useState(false);
  const [winningCup, setWinningCup] = useState<number | null>(null);

  const play = (choice: number) => {
    if (shuffling || balance < bet || bet <= 0) return;
    removeBet(bet);
    setShuffling(true);
    setWinningCup(null);

    setTimeout(() => {
      const win = Math.floor(secureRandom() * 3);
      setWinningCup(win);
      setShuffling(false);
      if (choice === win) addWin(bet * 3);
    }, 1500);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl">
      <div className="flex justify-center gap-10 mb-16 relative h-40">
        {[0, 1, 2].map(i => (
          <motion.div 
            key={i} 
            animate={shuffling ? { 
                y: [0, -60, 0], 
                x: [0, (i === 1 ? -100 : 100), 0] 
            } : {}} 
            transition={{ repeat: shuffling ? Infinity : 0, duration: 0.4 }} 
            onClick={() => play(i)} 
            className={`w-28 h-36 rounded-t-[4rem] cursor-pointer transition-all border-b-8 border-red-700 shadow-2xl ${winningCup === i ? 'bg-white -translate-y-10' : 'bg-red-600 hover:-translate-y-2'}`}
          />
        ))}
      </div>

      <div className="max-w-sm mx-auto space-y-6">
        <p className="font-black text-white/40 uppercase tracking-widest italic">Choose a cup to wager your candy</p>
        <div className="flex gap-4">
             <input 
                type="number" value={bet} onChange={e => setBet(Number(e.target.value))} disabled={shuffling}
                className="w-full bg-black border border-white/10 p-5 rounded-2xl font-black text-2xl outline-none" 
            />
        </div>
      </div>
    </div>
  );
};