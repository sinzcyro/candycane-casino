import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { secureRandom } from '../utils/crypto';
import { motion } from 'framer-motion';

export const Roulette = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const roll = (color: 'red' | 'black' | 'green') => {
    if (rolling || balance < bet) return;
    removeBet(bet);
    setRolling(true);
    setResult(null);

    setTimeout(() => {
      const num = Math.floor(secureRandom() * 15); // 0-14
      setResult(num);
      setRolling(false);
      const landedColor = num === 0 ? 'green' : (num % 2 === 0 ? 'black' : 'red');
      if (color === landedColor) {
        addWin(landedColor === 'green' ? bet * 14 : bet * 2);
      }
    }, 1500);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl">
      <div className="h-20 bg-black rounded-2xl mb-8 flex items-center justify-center border border-white/5 overflow-hidden relative">
         <motion.div animate={rolling ? { x: [-100, 100, -100] } : {}} transition={{ repeat: Infinity, duration: 0.2 }} className="text-4xl font-black italic">{result !== null ? result : '???'}</motion.div>
         {result !== null && <div className={`absolute inset-0 opacity-20 ${result === 0 ? 'bg-green-500' : (result % 2 === 0 ? 'bg-zinc-600' : 'bg-red-600')}`} />}
      </div>
      <div className="flex gap-4 mb-4">
        <button onClick={() => roll('red')} className="flex-1 bg-red-600 p-4 rounded-xl font-black">RED 2x</button>
        <button onClick={() => roll('green')} className="flex-1 bg-emerald-500 p-4 rounded-xl font-black text-black">GREEN 14x</button>
        <button onClick={() => roll('black')} className="flex-1 bg-zinc-800 p-4 rounded-xl font-black">BLACK 2x</button>
      </div>
    </div>
  );
};