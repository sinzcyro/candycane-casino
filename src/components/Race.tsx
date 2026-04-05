import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';

export const Race = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const bet = 100;

  const start = (choice: number) => {
    if (racing || balance < bet) return;
    removeBet(bet);
    setRacing(true);
    setWinner(null);

    setTimeout(() => {
      const win = Math.floor(secureRandom() * 4);
      setWinner(win);
      setRacing(false);
      if (choice === win) addWin(bet * 4);
    }, 2000);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
      <div className="space-y-4 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-black/40 rounded-xl relative border border-white/5 overflow-hidden">
             <motion.div animate={racing ? { x: [0, 400, 200, 500] } : { x: winner === i ? 500 : 0 }} transition={{ duration: 2 }} className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl">🏇</motion.div>
             {winner === i && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-red-500 uppercase italic">Winner!</div>}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3].map(i => <button key={i} onClick={() => start(i)} disabled={racing} className="bg-white text-black font-black py-3 rounded-xl hover:bg-red-600 transition-colors uppercase italic text-xs">Lane {i+1}</button>)}
      </div>
    </div>
  );
};