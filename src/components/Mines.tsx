import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Bomb, Candy } from 'lucide-react';
import { secureRandom } from '../utils/crypto';

export const Mines = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);

  const calculateMult = (revs: number) => {
    let m = 1;
    for (let i = 0; i < revs; i++) m *= (25 - i) / (25 - mineCount - i);
    return m * 0.98;
  };

  const start = () => {
    if (bet > balance || bet <= 0) return;
    removeBet(bet);
    const newGrid = new Array(25).fill('gem');
    let placed = 0;
    while (placed < mineCount) {
      const idx = Math.floor(secureRandom() * 25);
      if (newGrid[idx] !== 'bomb') { newGrid[idx] = 'bomb'; placed++; }
    }
    setGrid(newGrid); setRevealed([]); setIsPlaying(true); setMultiplier(1);
  };

  const handleTile = (idx: number) => {
    if (!isPlaying || revealed.includes(idx)) return;
    if (grid[idx] === 'bomb') {
      setIsPlaying(false);
      setRevealed(Array.from({length: 25}, (_, i) => i));
    } else {
      const next = [...revealed, idx];
      setRevealed(next);
      setMultiplier(calculateMult(next.length));
    }
  };

  const cashout = () => {
    addWin(Math.floor(bet * multiplier));
    setIsPlaying(false);
    setRevealed(Array.from({length: 25}, (_, i) => i));
    confetti({ colors: ['#ff0000', '#ffffff'] });
  };

  return (
    <div className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 flex flex-col lg:flex-row gap-10">
      <div className="w-full lg:w-72 space-y-6">
        <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] font-black text-white/20 uppercase mb-1">Bet Amount</p>
          <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} disabled={isPlaying} className="w-full bg-transparent font-black text-xl outline-none" />
        </div>
        <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] font-black text-white/20 uppercase mb-2">Mines: {mineCount}</p>
          <input type="range" min="1" max="24" value={mineCount} onChange={e => setMineCount(Number(e.target.value))} disabled={isPlaying} className="w-full accent-red-600" />
        </div>
        {isPlaying ? (
          <motion.button whileTap={{ scale: 0.95 }} onClick={cashout} className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl">CASHOUT ${(bet * multiplier).toFixed(2)}</motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.95 }} onClick={start} className="w-full bg-white text-black font-black py-5 rounded-2xl">PLAY</motion.button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-3 flex-1 aspect-square max-w-[500px]">
        {new Array(25).fill(0).map((_, i) => (
          <motion.div
            key={i}
            whileHover={!revealed.includes(i) ? { scale: 1.05, backgroundColor: '#3d0a0a' } : {}}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTile(i)}
            className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer border-2 transition-all ${revealed.includes(i) ? (grid[i] === 'bomb' ? 'bg-white border-red-500 shadow-xl' : 'bg-[#0f0202] border-red-500/50') : 'bg-[#2a0a0a] border-white/5'}`}
          >
            {revealed.includes(i) && (grid[i] === 'bomb' ? <Bomb size={28} className="text-red-600" /> : <Candy size={28} className="text-red-500" />)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};