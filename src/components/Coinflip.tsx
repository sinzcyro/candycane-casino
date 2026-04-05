import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { secureRandom } from '../utils/crypto';

export const Coinflip = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [flipping, setFlipping] = useState(false);
  const [res, setRes] = useState<'heads' | 'tails' | null>(null);

  const flip = (side: 'heads' | 'tails') => {
    if (bet > balance || flipping || bet <= 0) return;

    removeBet(bet); // Money taken instantly
    setFlipping(true);
    setRes(null);

    setTimeout(() => {
      const outcome = secureRandom() > 0.5 ? 'heads' : 'tails';
      setRes(outcome);
      setFlipping(false);

      if (outcome === side) {
        addWin(bet * 2); // Payback only after reveal
        confetti({ particleCount: 150, colors: ['#ff0000', '#ffffff'] });
      }
    }, 1000);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 flex flex-col items-center gap-10 shadow-2xl">
      <motion.div 
        animate={flipping ? { rotateY: [0, 1800], y: [0, -60, 0] } : { rotateY: 0, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className={`w-40 h-40 rounded-full border-[8px] flex items-center justify-center text-6xl font-black shadow-2xl ${
          flipping ? 'bg-zinc-800 border-zinc-700' : 
          res === 'heads' ? 'bg-red-600 border-white text-white' : 
          res === 'tails' ? 'bg-white border-red-600 text-red-600' : 'bg-zinc-900 border-white/10'
        }`}
      >
        {flipping ? '' : res === 'heads' ? 'R' : res === 'tails' ? 'W' : '?'}
      </motion.div>

      <div className="w-full max-w-xs space-y-6">
        <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-full bg-black/50 p-5 rounded-2xl text-center font-black text-2xl outline-none border border-white/5" />
        <div className="flex gap-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => flip('heads')} disabled={flipping} className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#991b1b]">RED</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => flip('tails')} disabled={flipping} className="flex-1 bg-white text-black font-black py-4 rounded-2xl shadow-[0_4px_0_#ccc]">WHITE</motion.button>
        </div>
      </div>
    </div>
  );
};