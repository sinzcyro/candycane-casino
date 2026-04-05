import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';

export const Cups = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet] = useState(100);
  const [shuffling, setShuffling] = useState(false);
  const [winningCup, setWinningCup] = useState<number | null>(null);

  const play = (choice: number) => {
    if (shuffling || balance < bet) return;
    removeBet(bet);
    setShuffling(true);
    setWinningCup(null);

    setTimeout(() => {
      const win = Math.floor(secureRandom() * 3);
      setWinningCup(win);
      setShuffling(false);
      if (choice === win) addWin(bet * 3);
    }, 1000);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center">
      <div className="flex justify-center gap-10 mb-10">
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={shuffling ? { y: [0, -50, 0], x: [0, 20, -20, 0] } : {}} transition={{ repeat: shuffling ? Infinity : 0, duration: 0.5 }} onClick={() => play(i)} className={`w-24 h-32 rounded-t-full cursor-pointer transition-all border-b-4 border-red-500 ${winningCup === i ? 'bg-white' : 'bg-red-600'}`} />
        ))}
      </div>
      <p className="font-black text-white/40 uppercase tracking-widest italic">Find the candy under the cup</p>
    </div>
  );
};