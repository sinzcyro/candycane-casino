import { useState, useEffect } from 'react'
import { useWallet } from './context/WalletContext'
import { Coinflip } from './components/Coinflip'
import { Mines } from './components/Mines'
import { Blackjack } from './components/Blackjack'
import { Arena } from './components/Arena'
import { CandyShop } from './components/CandyShop'
import { Leaderboard } from './components/Leaderboard'
import { AdminPanel } from './components/AdminPanel'
import { Auth } from './components/Auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Candy, User as UserIcon, LayoutDashboard, Trophy, LogOut, Crown, ShieldAlert, Gift, Clock, Sword, ShoppingBag, Send } from 'lucide-react'
import confetti from 'canvas-confetti'

type ViewType = 'home' | 'coinflip' | 'mines' | 'blackjack' | 'arena' | 'shop' | 'leaderboard' | 'admin';

function App() {
  const { user, balance, isOwner, signOut, loading, lastClaim, claimDaily } = useWallet();
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [showMenu, setShowMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (!lastClaim) { setCanClaim(true); return; }
    const updateTimer = () => {
      const diff = (new Date(lastClaim).getTime() + 86400000) - new Date().getTime();
      if (diff <= 0) { setCanClaim(true); setTimeLeft(""); }
      else {
        setCanClaim(false);
        const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastClaim]);

  if (loading) return null;
  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-[#0f0202] text-white selection:bg-red-500/30 font-sans pb-20">
      <nav className="border-b border-white/5 bg-[#1a0505]/95 backdrop-blur-md px-6 py-2 flex items-center justify-between sticky top-0 z-50">
        <motion.div whileHover={{ scale: 1.05 }} onClick={() => setActiveView('home')} className="cursor-pointer">
          <img src="/candycane.png" alt="Logo" className="h-14 w-auto" />
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="bg-[#2a0a0a] border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
            <Wallet size={18} className="text-red-500" />
            <span className="font-black text-lg">${balance?.toLocaleString()}</span>
          </div>

          <div className="relative">
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowMenu(!showMenu)} className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer ${isOwner ? 'bg-red-600 border-white' : 'bg-[#2a0a0a] border-white/10'}`}>
              {isOwner ? <Crown size={20} className="text-white fill-white" /> : <UserIcon size={20} />}
            </motion.div>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-60 bg-[#1a0505] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 z-[100]">
                  <div className="px-4 py-4 border-b border-white/5 mb-2 text-center font-black text-red-500 uppercase italic truncate">{user.username}</div>
                  <MenuBtn icon={<Sword size={16}/>} label="PVP ARENA" onClick={() => {setActiveView('arena'); setShowMenu(false)}} />
                  <MenuBtn icon={<ShoppingBag size={16}/>} label="CANDY SHOP" onClick={() => {setActiveView('shop'); setShowMenu(false)}} />
                  <MenuBtn icon={<Trophy size={16}/>} label="LEADERBOARD" onClick={() => {setActiveView('leaderboard'); setShowMenu(false)}} />
                  {isOwner && <MenuBtn icon={<ShieldAlert size={16}/>} label="ADMIN" onClick={() => {setActiveView('admin'); setShowMenu(false)}} />}
                  <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500 uppercase hover:bg-red-600 hover:text-white transition-all"><LogOut size={16}/> Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {activeView === 'home' ? (
            <div className="space-y-10">
              <div className="bg-[#1a0505] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${canClaim ? 'bg-red-600 animate-bounce' : 'bg-white/5'}`}><Gift size={32} /></div>
                  <div><h2 className="text-xl font-black italic uppercase">Daily Treat</h2><p className="text-white/40 text-xs font-bold uppercase">$15,000 Gift</p></div>
                </div>
                {canClaim ? <button onClick={() => {claimDaily(); confetti();}} className="bg-white text-black font-black px-10 py-4 rounded-2xl uppercase italic">Claim</button> : <div className="flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl"><Clock size={18} className="text-red-500" /><span className="font-black text-white/50">{timeLeft}</span></div>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GameCard title="PVP Arena" color="from-red-600 to-red-900" onClick={() => setActiveView('arena')} />
                <GameCard title="Candy Shop" color="from-amber-500 to-orange-700" onClick={() => setActiveView('shop')} />
                <GameCard title="Blackjack" color="from-zinc-100 to-zinc-300" darkText onClick={() => setActiveView('blackjack')} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button onClick={() => setActiveView('home')} className="flex items-center gap-2 text-white/30 hover:text-white font-black text-xs uppercase"><LayoutDashboard size={16}/> Lobby</button>
              {activeView === 'arena' && <Arena />}
              {activeView === 'shop' && <CandyShop />}
              {activeView === 'blackjack' && <Blackjack />}
              {activeView === 'leaderboard' && <Leaderboard />}
              {activeView === 'admin' && <AdminPanel />}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

const MenuBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-white/70 hover:bg-white/5 hover:text-white uppercase transition-colors">{icon} {label}</button>
);
function GameCard({ title, color, onClick, darkText = false }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.98 }} onClick={onClick} className={`h-64 rounded-[2.5rem] bg-gradient-to-br ${color} p-8 cursor-pointer overflow-hidden shadow-2xl border-2 border-white/5 flex flex-col justify-end group`}>
      <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${darkText ? 'text-black' : 'text-white'}`}>{title}</h3>
    </motion.div>
  )
}
export default App;