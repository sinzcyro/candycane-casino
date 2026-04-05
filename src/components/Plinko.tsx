import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { secureRandom } from '../utils/crypto';
import { Target } from 'lucide-react';

const MULTIPLIERS = [5.0, 2.0, 1.2, 0.5, 0.2, 0.5, 1.2, 2.0, 5.0];

export const Plinko = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [balls, setBalls] = useState<{ id: number; path: number[] }[]>([]);

  const dropBall = () => {
    if (bet > balance || bet <= 0) return;
    removeBet(bet);

    const id = Date.now();
    const path: number[] = [0];
    let currentPos = 0;

    // Ball falls through 8 rows
    for (let i = 0; i < 8; i++) {
      const direction = secureRandom() > 0.5 ? 1 : -1;
      currentPos += direction;
      path.push(currentPos);
    }

    setBalls(prev => [...prev, { id, path }]);

    // Calculate payout
    setTimeout(() => {
        // Map currentPos to index in MULTIPLIERS
        const finalIdx = Math.floor((currentPos + 8) / 2);
        const mult = MULTIPLIERS[Math.min(finalIdx, MULTIPLIERS.length - 1)];
        addWin(Math.floor(bet * mult));
        setBalls(prev => prev.filter(b => b.id !== id));
    }, 2500);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 flex flex-col items-center shadow-2xl">
      <div className="flex items-center gap-2 text-red-500 mb-10">
        <Target size={32} />
        <h2 className="text-3xl font-black italic uppercase italic">Candy Plinko</h2>
      </div>

      <div className="relative w-full max-w-[400px] h-[400px] mb-10 bg-black/20 rounded-3xl p-6 border border-white/5 overflow-hidden">
        {/* PEGS GRID */}
        {[...Array(8)].map((_, row) => (
          <div key={row} className="flex justify-center gap-6 mb-8">
            {[...Array(row + 3)].map((_, dot) => (
              <div key={dot} className="w-2 h-2 bg-white/10 rounded-full" />
            ))}
          </div>
        ))}

        {/* FALLING BALLS */}
        <AnimatePresence>
          {balls.map(ball => (
            <motion.div
              key={ball.id}
              initial={{ top: -20, left: '50%' }}
              animate={{ 
                top: [0, 50, 100, 150, 200, 250, 300, 350, 380],
                x: ball.path.map(p => p * 15)
              }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="absolute w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] z-50"
            />
          ))}
        </AnimatePresence>

        {/* MULTIPLIERS AT BOTTOM */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-2">
            {MULTIPLIERS.map((m, i) => (
                <div key={i} className={`text-[8px] font-black p-1 rounded border border-white/10 ${m >= 1 ? 'bg-red-600' : 'bg-zinc-800'}`}>{m}x</div>
            ))}
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
        <input 
          type="number" value={bet} onChange={e => setBet(Number(e.target.value))}
          className="flex-1 bg-black border border-white/10 p-5 rounded-2xl font-black text-2xl outline-none text-center" 
        />
        <button onClick={dropBall} className="bg-white text-black font-black px-10 py-5 rounded-2xl uppercase italic shadow-lg active:scale-95 transition-all">Drop</button>
      </div>
    </div>
  );
};