import { useState } from 'react'
import { useWallet } from './context/WalletContext'
import { Coinflip } from './components/Coinflip'
import { Mines } from './components/Mines'
import { Blackjack } from './components/Blackjack'
import { Leaderboard } from './components/Leaderboard'
import { Shop } from './components/Shop'
import { Auth } from './components/Auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Candy, User as UserIcon, LayoutDashboard, Trophy, ShoppingBag, LogOut, Crown } from 'lucide-react'

function App() {
  const { user, balance, inventory, isOwner, signOut, loading } = useWallet();
  const [activeView, setActiveView] = useState<'home' | 'coinflip' | 'mines' | 'blackjack' | 'leaderboard' | 'shop'>('home');
  const [showMenu, setShowMenu] = useState(false);

  if (loading) return null; // Prevents the flash
  if (!user) return <Auth />;

  const hasGlow = inventory?.includes('red-glow');

  return (
    <div className="min-h-screen bg-[#0f0202] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      <nav className="border-b border-white/5 bg-[#1a0505]/95 backdrop-blur-md px-6 py-2 flex items-center justify-between sticky top-0 z-50">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer" onClick={() => setActiveView('home')}>
          <img src="/candycane.png" alt="Logo" className="h-16 w-auto object-contain" />
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.div 
            key={balance}
            animate={{ scale: [1, 1.1, 1] }}
            className={`bg-[#2a0a0a] border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg transition-all ${hasGlow ? 'shadow-[0_0_25px_rgba(239,68,68,0.4)] border-red-500' : ''}`}
          >
            <Wallet size={18} className="text-red-500" />
            <span className="font-black text-lg tracking-tight">${balance?.toLocaleString()}</span>
          </motion.div>

          <div className="relative">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-all ${isOwner ? 'bg-red-600 border-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-[#2a0a0a] border-white/10'}`}
            >
              {isOwner ? <Crown size={20} className="text-white fill-white" /> : <UserIcon size={20} />}
            </motion.div>

            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-64 bg-[#1a0505] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-2 z-[100] backdrop-blur-xl">
                  <div className="px-4 py-4 border-b border-white/5 mb-2 bg-white/5 rounded-2xl mx-1">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-2">Member</p>
                    <p className="font-black text-red-500 flex items-center gap-2 uppercase italic text-lg truncate">
                      {user.username} {isOwner && <Crown size={14} className="fill-red-500"/>}
                    </p>
                  </div>
                  <MenuBtn icon={<UserIcon size={16}/>} label="MY PROFILE" onClick={() => {setActiveView('home'); setShowMenu(false)}} />
                  <MenuBtn icon={<Trophy size={16}/>} label="LEADERBOARD" onClick={() => {setActiveView('leaderboard'); setShowMenu(false)}} />
                  <MenuBtn icon={<ShoppingBag size={16}/>} label="CANDY SHOP" onClick={() => {setActiveView('shop'); setShowMenu(false)}} />
                  <div className="h-[1px] bg-white/5 my-2" />
                  <MenuBtn icon={<LogOut size={16}/>} label="LOGOUT" onClick={() => signOut()} danger />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 lg:p-12">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="relative overflow-hidden w-full h-80 bg-gradient-to-br from-red-600 via-red-500 to-rose-800 rounded-[3rem] p-12 flex flex-col justify-center shadow-2xl">
                <h1 className="text-6xl font-black mb-2 uppercase italic tracking-tighter leading-none text-white drop-shadow-2xl">Sweet Wins <br/>Await You</h1>
                <p className="text-white/60 font-bold text-xs tracking-[0.4em] uppercase">Provably Fair Candy Casino</p>
                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,white_40px,white_80px)]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GameCard title="Coinflip" desc="Double or Nothing" color="from-red-500 to-red-700" onClick={() => setActiveView('coinflip')} />
                <GameCard title="Mines" desc="Avoid the Bombs" color="from-rose-500 to-rose-800" onClick={() => setActiveView('mines')} />
                <GameCard title="Blackjack" desc="Candy 21" color="from-zinc-100 to-zinc-300" darkText onClick={() => setActiveView('blackjack')} />
              </div>
            </motion.div>
          )}
          {activeView === 'coinflip' && <div className="max-w-xl mx-auto space-y-6"><BackBtn onClick={()=>setActiveView('home')}/><Coinflip /></div>}
          {activeView === 'mines' && <div className="max-w-4xl mx-auto space-y-6"><BackBtn onClick={()=>setActiveView('home')}/><Mines /></div>}
          {activeView === 'blackjack' && <div className="max-w-3xl mx-auto space-y-6"><BackBtn onClick={()=>setActiveView('home')}/><Blackjack /></div>}
          {activeView === 'leaderboard' && <div className="max-w-2xl mx-auto space-y-6"><BackBtn onClick={()=>setActiveView('home')}/><Leaderboard /></div>}
          {activeView === 'shop' && <div className="max-w-4xl mx-auto space-y-6"><BackBtn onClick={()=>setActiveView('home')}/><Shop /></div>}
        </AnimatePresence>
      </main>
    </div>
  )
}

const MenuBtn = ({ icon, label, onClick, danger = false }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-colors ${danger ? 'text-red-500 hover:bg-red-500 hover:text-white' : 'hover:bg-white/5 text-white/70 hover:text-white'}`}>{icon} {label}</button>
);
const BackBtn = ({ onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-2 text-white/30 hover:text-white font-black text-xs uppercase tracking-widest transition-colors mb-4"><LayoutDashboard size={16}/> Lobby</button>
);
function GameCard({ title, desc, color, onClick, darkText = false }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.98 }} onClick={onClick} className={`h-64 rounded-[2.5rem] bg-gradient-to-br ${color} p-8 cursor-pointer overflow-hidden shadow-2xl border-2 border-white/5 relative group`}>
      <div className="flex items-center gap-2 mb-2 text-red-500/50 uppercase font-black text-[10px] tracking-widest italic"><Candy size={14} /> Candy Original</div>
      <h3 className={`text-4xl font-black italic uppercase tracking-tighter leading-none ${darkText ? 'text-black' : 'text-white'}`}>{title}</h3>
      <p className={`${darkText ? 'text-black/40' : 'text-white/60'} font-bold text-sm mt-1 uppercase`}>{desc}</p>
    </motion.div>
  )
}
export default App