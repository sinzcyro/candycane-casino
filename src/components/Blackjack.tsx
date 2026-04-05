import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { secureRandom } from '../utils/crypto';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const Blackjack = () => {
  const { balance, addWin, removeBet } = useWallet();
  const [stage, setStage] = useState<'betting' | 'playing' | 'result'>('betting');
  const [bet, setBet] = useState(100);
  const [playerHand, setPlayerHand] = useState<number[]>([]);
  const [dealerHand, setDealerHand] = useState<number[]>([]);
  const [msg, setMsg] = useState('');

  const getCard = () => Math.min(10, Math.floor(secureRandom() * 11) + 1);
  const getSum = (h: number[]) => h.reduce((a, b) => a + b, 0);

  const start = () => {
    if (bet > balance || bet <= 0) return;
    removeBet(bet);
    setPlayerHand([getCard(), getCard()]);
    setDealerHand([getCard()]);
    setStage('playing');
  };

  const hit = () => {
    const newHand = [...playerHand, getCard()];
    setPlayerHand(newHand);
    if (getSum(newHand) > 21) end('Dealer Wins (Bust)');
  };

  const stand = () => {
    let d = [...dealerHand];
    while (getSum(d) < 17) d.push(getCard());
    setDealerHand(d);
    const pS = getSum(playerHand); const dS = getSum(d);
    if (dS > 21 || pS > dS) end('You Win!', true);
    else if (pS === dS) end('Push!', false, true);
    else end('Dealer Wins!');
  };

  const end = (m: string, win = false, push = false) => {
    setMsg(m); setStage('result');
    if (win) { addWin(bet * 2); confetti({ colors: ['#ff0000', '#ffffff'] }); }
    else if (push) addWin(bet);
  };

  return (
    <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 text-center shadow-2xl">
      <div className="grid grid-cols-2 gap-10 mb-12">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Dealer ({getSum(dealerHand)})</p>
          <div className="flex justify-center gap-3">
            {dealerHand.map((c, i) => <Card key={i} val={c} color="bg-white text-black" />)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black text-red-500/40 uppercase tracking-widest">You ({getSum(playerHand)})</p>
          <div className="flex justify-center gap-3">
            {playerHand.map((c, i) => <Card key={i} val={c} color="bg-red-600 text-white" />)}
          </div>
        </div>
      </div>
      {stage === 'playing' ? (
        <div className="flex gap-4 max-w-sm mx-auto">
          <motion.button whileTap={{ scale: 0.9 }} onClick={hit} className="flex-1 bg-white text-black font-black py-4 rounded-2xl shadow-[0_4px_0_#ccc] transition-all">HIT</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={stand} className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_#991b1b] transition-all">STAND</motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          {stage === 'result' && <p className="text-3xl font-black italic uppercase text-red-500">{msg}</p>}
          <div className="flex justify-center items-center gap-4">
            <input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="bg-black/50 p-4 rounded-2xl w-32 font-black outline-none border border-white/5" />
            <motion.button whileTap={{ scale: 0.95 }} onClick={start} className="bg-red-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl">DEAL</motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

const Card = ({val, color}: any) => (
  <motion.div initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} className={`w-14 h-20 ${color} rounded-xl flex items-center justify-center text-2xl font-black shadow-xl`}>{val}</motion.div>
);