import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';
import { FastForward, Flag, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const HORSES = [
  { id: 0, img: '🐎', color: 'bg-red-500', name: 'Cherry Dash' },
  { id: 1, img: '🏇', color: 'bg-white', name: 'Sugar Sprint' },
  { id: 2, img: '🎠', color: 'bg-rose-600', name: 'Cane Crawler' },
  { id: 3, img: '🐎', color: 'bg-zinc-400', name: 'Minty Mover' }
];

export const Race = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [chosenHorse, setChosenHorse] = useState<number | null>(null);
  const [positions, setPositions] = useState([0, 0, 0, 0]);

  const startRace = () => {
    if (chosenHorse === null || bet > balance || bet <= 0 || racing) return;
    removeBet(bet);
    setRacing(true);
    setWinner(null);
    setPositions([0, 0, 0, 0]);

    const duration = 4000; // 4 seconds
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      setPositions(prev => prev.map(p => {
        if (p >= 90) return p;
        // Random speed boost per horse to make it look like a real struggle
        return p + (secureRandom() * 4);
      }));

      currentStep++;
      if (currentStep >= steps) {
        clearInterval(interval);
        finishRace();
      }
    }, intervalTime);
  };

  const finishRace = () => {
    setPositions(prev => {
      const winIdx = prev.indexOf(Math.max(...prev));
      setWinner(winIdx);
      setRacing(false);
      if (winIdx === chosenHorse) {
        addWin(bet * 4);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
      return prev;
    });
  };

  return (
    <div className="bg-[#1a0505] p-8 rounded-[3rem] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-red-500">
           <FastForward size={32} />
           <h2 className="text-2xl font-black italic uppercase italic">Candy Derby</h2>
        </div>
        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
            <span className="text-[10px] font-black text-white/40 uppercase mr-2 tracking-widest">Payout</span>
            <span className="text-red-500 font-black">4.0x</span>
        </div>
      </div>

      {/* THE TRACK */}
      <div className="relative bg-[#0a0b0d] rounded-2xl p-4 border-y-4 border-white/5 overflow-hidden mb-8 space-y-4">
        {/* Dirt/Stripes Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,white_50px,white_52px)]" />
        
        {HORSES.map((h, i) => (
          <div key={h.id} className="relative h-12 border-b border-white/5 last:border-0">
             <motion.div 
               animate={{ left: `${positions[i]}%` }}
               transition={{ type: 'spring', damping: 10, stiffness: 50 }}
               className="absolute flex items-center gap-2 -translate-y-1/2 top-1/2"
             >
                <div className={`text-3xl ${racing ? 'animate-bounce' : ''}`}>{h.img}</div>
                {winner === i && <Trophy size={16} className="text-yellow-500 animate-pulse" />}
             </motion.div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2"><Flag size={16} className="text-white/10" /></div>
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Select your horse</p>
          <div className="grid grid-cols-2 gap-2">
            {HORSES.map(h => (
              <button 
                key={h.id}
                onClick={() => setChosenHorse(h.id)}
                className={`p-3 rounded-xl border text-xs font-black uppercase transition-all ${chosenHorse === h.id ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-black border-white/5 text-white/40'}`}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Wager</p>
          <div className="flex gap-2">
            <input 
              type="number" value={bet} onChange={e => setBet(Number(e.target.value))} disabled={racing}
              className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-xl text-center"
            />
            <button 
              onClick={startRace} disabled={racing || chosenHorse === null}
              className="bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase italic"
            >
              Race
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};