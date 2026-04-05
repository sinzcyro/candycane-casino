import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { secureRandom } from '../utils/crypto';

export const Crash = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [bet, setBet] = useState(100);
  const [status, setStatus] = useState<'idle' | 'running' | 'crashed'>('idle');
  const [mult, setMult] = useState(1.00);
  const crashAt = useRef(0);

  const start = () => {
    if (bet > balance || bet <= 0) return;
    removeBet(bet);
    // House Edge: Crash at 1.00 sometimes
    crashAt.current = secureRandom() < 0.03 ? 1.00 : 0.99 / (1 - secureRandom());
    setMult(1.00);
    setStatus('running');
  };

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => {
      setMult(prev => {
        const next = prev + (prev * 0.01);
        if (next >= crashAt.current) {
          setStatus('crashed');
          clearInterval(interval);
          return crashAt.current;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [status]);

  const cashout = () => {
    if (status !== 'running') return;
    addWin(Math.floor(bet * mult));
    setStatus('idle');
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl">
      <div className="h-64 flex flex-col items-center justify-center bg-black/40 rounded-[2rem] mb-8 border border-white/5 relative overflow-hidden">
        <h1 className={`text-8xl font-black italic ${status === 'crashed' ? 'text-red-600' : 'text-white'}`}>{mult.toFixed(2)}x</h1>
        {status === 'crashed' && <p className="text-red-500 font-black uppercase tracking-widest mt-2">Crashed!</p>}
        <div className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all" style={{ width: `${(mult/10) * 100}%` }} />
      </div>

      <div className="max-w-xs mx-auto space-y-4">
        <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} disabled={status==='running'} className="w-full bg-black p-4 rounded-2xl text-center font-black text-xl border border-white/5" />
        {status === 'running' ? (
          <button onClick={cashout} className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl animate-pulse">CASHOUT ${(bet * mult).toFixed(0)}</button>
        ) : (
          <button onClick={start} className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase">Place Bet</button>
        )}
      </div>
    </div>
  );
};