import { useState, useEffect } from 'react'
import { useWallet } from './context/WalletContext'
import { Coinflip } from './components/Coinflip'
import { Mines } from './components/Mines'
import { Blackjack } from './components/Blackjack'
import { Crash } from './components/Crash'
import { Slots } from './components/Slots'
import { Roulette } from './components/Roulette'
import { Cups } from './components/Cups'
import { Tower } from './components/Tower'
import { Race } from './components/Race'
import { Plinko } from './components/Plinko'
import { Arena } from './components/Arena'
import { CandyShop } from './components/CandyShop'
import { Inventory } from './components/Inventory'
import { Explore } from './components/Explore'
import { Transfer } from './components/Transfer'
import { About } from './components/About'
import { Leaderboard } from './components/Leaderboard'
import { AdminPanel } from './components/AdminPanel'
import { Chat } from './components/Chat'
import { Auth } from './components/Auth'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, Candy, User as UserIcon, LayoutDashboard, Trophy, LogOut, 
  Crown, ShieldAlert, Gift, Clock, Zap, Target, Disc, Layers, 
  Cherry, FastForward, Send, Info, Swords, ShoppingBag, Package, Heart, Map 
} from 'lucide-react'
import confetti from 'canvas-confetti'

type ViewType = 'home' | 'coinflip' | 'mines' | 'blackjack' | 'crash' | 'slots' | 'roulette' | 'cups' | 'tower' | 'race' | 'plinko' | 'transfer' | 'leaderboard' | 'admin' | 'about' | 'arena' | 'shop' | 'inventory' | 'explore';

function App() {
  const { user, balance, stats, isOwner, signOut, lastClaim, claimDaily } = useWallet();
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

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-[#0f0202] text-white selection:bg-red-500/30 font-sans pb-20 overflow-x-hidden">
      <nav className="border-b border-white/5 bg-[#1a0505]/95 backdrop-blur-md px-6 py-2 flex items-center justify-between sticky top-0 z-50">
        <motion.div whileHover={{ scale: 1.05 }} onClick={() => setActiveView('home')} className="cursor-pointer">
          <img src="/candycane.png" alt="Logo" className="h-14 w-auto object-contain" />
        </motion.div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-[#2a0a0a] border border-red-500/20 px-4 py-2 rounded-xl shadow-lg min-w-[140px]">
            <Heart size={18} className="text-red-500 fill-red-500" />
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div animate={{ width: `${Math.min(100, (stats.hp / stats.maxHp) * 100)}%` }} className="h-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            </div>
            <span className="text-[10px] font-black text-white/50">{stats.hp}</span>
          </div>
          <div className="bg-[#2a0a0a] border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
            <Wallet size={18} className="text-red-500" />
            <span className="font-black text-lg tracking-tight">${balance?.toLocaleString()}</span>
          </div>
          <div className="relative">
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowMenu(!showMenu)} className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-all ${isOwner ? 'bg-red-600 border-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#2a0a0a] border-white/10'}`}>
              {isOwner ? <Crown size={20} className="text-white fill-white" /> : <UserIcon size={20} />}
            </motion.div>
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-64 bg-[#1a0505] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 z-[100]">
                  <div className="px-4 py-4 border-b border-white/5 mb-2 text-center font-black text-red-500 uppercase italic truncate text-lg">{user.user_metadata?.username || 'Player'}</div>
                  <MenuBtn icon={<Package size={16}/>} label="MY VAULT" onClick={() => {setActiveView('inventory'); setShowMenu(false)}} />
                  <MenuBtn icon={<Map size={16} className="text-red-500"/>} label="WILD EXPLORE" onClick={() => {setActiveView('explore'); setShowMenu(false)}} />
                  <MenuBtn icon={<Swords size={16}/>} label="PVP ARENA" onClick={() => {setActiveView('arena'); setShowMenu(false)}} />
                  <MenuBtn icon={<ShoppingBag size={16}/>} label="CANDY SHOP" onClick={() => {setActiveView('shop'); setShowMenu(false)}} />
                  <div className="h-[1px] bg-white/5 my-1" />
                  <MenuBtn icon={<Send size={16} className="text-red-500" />} label="TRANSFER MONEY" onClick={() => {setActiveView('transfer'); setShowMenu(false)}} />
                  <MenuBtn icon={<Trophy size={16} className="text-red-500" />} label="LEADERBOARD" onClick={() => {setActiveView('leaderboard'); setShowMenu(false)}} />
                  {isOwner && <MenuBtn icon={<ShieldAlert size={16}/>} label="ADMIN TOOLS" onClick={() => {setActiveView('admin'); setShowMenu(false)}} />}
                  <div className="h-[1px] bg-white/5 my-1" />
                  <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500 hover:bg-red-600 hover:text-white transition-all"><LogOut size={16}/> Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {activeView === 'home' ? (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-12 gap-8 py-6">
              <div className="lg:col-span-8 space-y-8">
                <div className="relative overflow-hidden w-full h-80 bg-gradient-to-br from-red-600 to-rose-950 rounded-[3rem] p-12 flex flex-col justify-center shadow-2xl border-b-8 border-black/40 text-center">
                    <h1 className="text-7xl font-black mb-2 uppercase italic tracking-tighter text-white drop-shadow-2xl leading-none">SWEET WINS</h1>
                    <p className="text-white/60 font-bold text-sm tracking-[0.4em] uppercase mb-4">Provably Fair Candy Casino</p>
                    <div className="bg-white/10 w-fit px-6 py-2 rounded-full border border-white/20 backdrop-blur-md mx-auto"><p className="text-white font-black text-xs uppercase tracking-widest animate-pulse">🎁 5 INVITES = 5 MILLION CANDY</p></div>
                </div>
                <div className="bg-[#1a0505] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between shadow-xl border-l-4 border-l-red-600">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${canClaim ? 'bg-red-600 animate-bounce' : 'bg-white/5'}`}><Gift size={32} /></div>
                        <div><h2 className="text-xl font-black italic uppercase">Daily Treat</h2><p className="text-white/40 text-xs font-bold uppercase">$15,000 Gift</p></div>
                    </div>
                    {canClaim ? <button onClick={() => {claimDaily(); confetti();}} className="bg-white text-black font-black px-10 py-4 rounded-2xl uppercase italic hover:bg-red-600 hover:text-white transition-all shadow-xl">Claim</button> : <div className="flex items-center gap-3 bg-black/40 px-6 py-4 rounded-2xl border border-white/5"><Clock size={18} className="text-red-500" /><span className="font-black text-white/50">{timeLeft}</span></div>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GameCard title="PVP Arena" icon={<Swords/>} color="from-red-700 to-black" onClick={() => setActiveView('arena')} />
                    <GameCard title="Candy Shop" icon={<ShoppingBag/>} color="from-amber-500 to-orange-700" onClick={() => setActiveView('shop')} />
                    <GameCard title="Wild Explore" icon={<Map/>} color="from-emerald-700 to-teal-900" onClick={() => setActiveView('explore')} />
                    <GameCard title="Plinko" icon={<Target/>} color="from-red-400 to-red-600" onClick={() => setActiveView('plinko')} />
                    <GameCard title="Crash" icon={<Zap/>} color="from-orange-500 to-red-600" onClick={() => setActiveView('crash')} />
                    <GameCard title="Slots" icon={<Cherry/>} color="from-purple-600 to-pink-600" onClick={() => setActiveView('slots')} />
                    <GameCard title="Mines" icon={<Target/>} color="from-rose-500 to-rose-800" onClick={() => setActiveView('mines')} />
                    <GameCard title="Roulette" icon={<Disc/>} color="from-zinc-800 to-black" onClick={() => setActiveView('roulette')} />
                    <GameCard title="Blackjack" icon={<Candy/>} color="from-zinc-100 to-zinc-300" darkText onClick={() => setActiveView('blackjack')} />
                    <GameCard title="Coinflip" icon={<Disc/>} color="from-red-500 to-red-700" onClick={() => setActiveView('coinflip')} />
                    <GameCard title="Racing" icon={<FastForward/>} color="from-emerald-500 to-teal-700" onClick={() => setActiveView('race')} />
                    <GameCard title="Stack" icon={<Layers/>} color="from-blue-500 to-cyan-600" onClick={() => setActiveView('tower')} />
                </div>
              </div>
              <div className="lg:col-span-4 sticky top-24"><Chat /></div>
            </motion.div>
          ) : (
            <div className="space-y-6 pt-6">
              <button onClick={() => setActiveView('home')} className="flex items-center gap-2 text-white/30 hover:text-white font-black text-xs uppercase transition-colors"><LayoutDashboard size={16}/> Lobby</button>
              <div className="w-full">
                {activeView === 'arena' && <Arena />}
                {activeView === 'shop' && <CandyShop />}
                {activeView === 'inventory' && <Inventory />}
                {activeView === 'explore' && <Explore />}
                {activeView === 'coinflip' && <Coinflip />}
                {activeView === 'mines' && <Mines />}
                {activeView === 'blackjack' && <Blackjack />}
                {activeView === 'crash' && <Crash />}
                {activeView === 'slots' && <Slots />}
                {activeView === 'roulette' && <Roulette />}
                {activeView === 'cups' && <Cups />}
                {activeView === 'tower' && <Tower />}
                {activeView === 'race' && <Race />}
                {activeView === 'plinko' && <Plinko />}
                {activeView === 'leaderboard' && <Leaderboard />}
                {activeView === 'transfer' && <Transfer />}
                {activeView === 'admin' && <AdminPanel />}
                {activeView === 'about' && <About />}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function GameCard({ title, icon, color, onClick, darkText = false }: any) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -4 }} onClick={onClick} className={`h-44 rounded-[2.5rem] bg-gradient-to-br ${color} p-8 cursor-pointer overflow-hidden shadow-2xl border border-white/5 flex flex-col justify-between group transition-all`}>
       <div className={`${darkText ? 'text-black/20' : 'text-white/20'}`}>{icon}</div>
       <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${darkText ? 'text-black' : 'text-white'}`}>{title}</h3>
    </motion.div>
  )
}

function MenuBtn({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-white/70 hover:bg-white/5 hover:text-white uppercase transition-all">
      {icon} {label}
    </button>
  );
}

export default App;