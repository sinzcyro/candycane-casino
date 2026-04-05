import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';
import confetti from 'canvas-confetti';
import { Cherry } from 'lucide-react';

const SYMBOLS = ['🍭', '🍬', '🍒', '🍓', '🧁', '💎'];

export const Slots = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [reels, setReels] = useState(['🍭', '🍭', '🍭']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(100);

  const spin = () => {
    if (spinning || balance < bet || bet <= 0) return;
    removeBet(bet);
    setSpinning(true);
    
    setTimeout(() => {
      const result = [SYMBOLS[Math.floor(secureRandom()*6)], SYMBOLS[Math.floor(secureRandom()*6)], SYMBOLS[Math.floor(secureRandom()*6)]];
      setReels(result);
      setSpinning(false);
      if (result[0] === result[1] && result[1] === result[2]) {
        addWin(bet * 50); // Big Win 50x
        confetti();
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        addWin(bet * 3); // 2 Match 3x
      }
    }, 1000);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl">
      <div className="flex items-center justify-center gap-2 mb-10 text-red-500">
        <Cherry size={32} />
        <h2 className="text-3xl font-black italic uppercase">Candy Slots</h2>
      </div>

      <div className="flex justify-center gap-6 mb-12">
        {reels.map((s, i) => (
          <motion.div 
            key={i} 
            animate={spinning ? { y: [0, -30, 30, 0] } : {}} 
            transition={{ repeat: spinning ? Infinity : 0, duration: 0.1 }} 
            className="w-32 h-44 bg-black rounded-3xl flex items-center justify-center text-7xl border-4 border-red-500/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          >
            {s}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4 max-w-sm mx-auto">
        <input 
            type="number" value={bet} onChange={e => setBet(Number(e.target.value))} disabled={spinning}
            className="flex-1 bg-black border border-white/10 p-5 rounded-2xl font-black text-2xl outline-none" 
        />
        <button onClick={spin} disabled={spinning} className="bg-red-600 text-white font-black px-12 py-5 rounded-2xl shadow-xl active:scale-95 transition-all italic">SPIN</button>
      </div>
    </div>
  );
};