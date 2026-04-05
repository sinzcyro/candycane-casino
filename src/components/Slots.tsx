import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';
import confetti from 'canvas-confetti';

const SYMBOLS = ['🍭', '🍬', '🍒', '🍓', '🧁', '💎'];

export const Slots = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [reels, setReels] = useState(['🍭', '🍭', '🍭']);
  const [spinning, setSpinning] = useState(false);
  const bet = 100;

  const spin = () => {
    if (spinning || balance < bet) return;
    removeBet(bet);
    setSpinning(true);
    
    setTimeout(() => {
      const result = [SYMBOLS[Math.floor(secureRandom()*6)], SYMBOLS[Math.floor(secureRandom()*6)], SYMBOLS[Math.floor(secureRandom()*6)]];
      setReels(result);
      setSpinning(false);
      if (result[0] === result[1] && result[1] === result[2]) {
        addWin(bet * 20);
        confetti();
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        addWin(bet * 2);
      }
    }, 800);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center">
      <div className="flex justify-center gap-4 mb-8">
        {reels.map((s, i) => (
          <motion.div key={i} animate={spinning ? { y: [0, -20, 20, 0] } : {}} transition={{ repeat: spinning ? Infinity : 0, duration: 0.1 }} className="w-24 h-32 bg-black rounded-2xl flex items-center justify-center text-5xl border-2 border-red-500/20 shadow-inner">{s}</motion.div>
        ))}
      </div>
      <button onClick={spin} disabled={spinning} className="bg-red-600 text-white font-black px-12 py-5 rounded-2xl shadow-xl active:scale-95 transition-all">SPIN $100</button>
    </div>
  );
};