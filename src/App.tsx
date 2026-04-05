import { useState } from 'react'
import { useWallet } from './context/WalletContext'
import { Coinflip } from './components/Coinflip'
import { Mines } from './components/Mines'
import { Blackjack } from './components/Blackjack'
import { Leaderboard } from './components/Leaderboard'
import { Auth } from './components/Auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Candy, User as UserIcon, LayoutDashboard, Trophy, LogOut, Crown } from 'lucide-react'

function App() {
  const { user, balance, isOwner, signOut, loading } = useWallet();
  const [activeView, setActiveView] = useState('home');
  const [showMenu, setShowMenu] = useState(false);

  if (loading) return null;
  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-[#0f0202] text-white selection:bg-red-500/30 font-sans">
      <nav className="border-b border-white/5 bg-[#1a0505]/95 backdrop-blur-md px-6 py-2 flex items-center justify-between sticky top-0 z-50">
        <motion.div whileHover={{ scale: 1.05 }} onClick={() => setActiveView('home')} className="cursor-pointer">
          <img src="/candycane.png" alt="Logo" className="h-16 w-auto" />
        </motion.div>

        <div className="flex items-center gap-4">
          <div className="bg-[#2a0a0a] border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
            <Wallet size={18} className="text-red-500" />
            <span className="font-black text-lg">${balance?.toLocaleString()}</span>
          </div>

          <div className="relative">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer ${isOwner ? 'bg-red-600 border-white' : 'bg-[#2a0a0a] border-white/10'}`}
            >
              {isOwner ? <Crown size={20} className="text-white fill-white" /> : <UserIcon size={20} />}
            </motion.div>

            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-60 bg-[#1a0505] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 z-[100]">
                  <div className="px-4 py-4 border-b border-white/5 mb-2 bg-white/5 rounded-2xl m-1">
                    <p className="font-black text-red-500 flex items-center gap-2 uppercase italic truncate">
                      {user.username} {isOwner && <Crown size={12} />}
                    </p>
                  </div>
                  <button onClick={() => {setActiveView('leaderboard'); setShowMenu(false)}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black hover:bg-white/5">
                    <Trophy size={16} className="text-red-500" /> LEADERBOARD
                  </button>
                  <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white text-red-500">
                    <LogOut size={16}/> LOGOUT
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {activeView === 'home' ? (
          <div className="space-y-12 py-10">
            <div className="relative overflow-hidden w-full h-80 bg-gradient-to-br from-red-600 to-rose-800 rounded-[3rem] p-12 flex flex-col justify-center shadow-2xl">
              <h1 className="text-7xl font-black mb-2 uppercase italic tracking-tighter leading-none">Sweet Wins <br/>Await You</h1>
              <p className="text-white/60 font-bold text-xs tracking-[0.4em] uppercase">Provably Fair Candy Casino</p>
              <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,white_40px,white_80px)]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GameCard title="Coinflip" color="from-red-500 to-red-700" onClick={() => setActiveView('coinflip')} />
              <GameCard title="Mines" color="from-rose-500 to-rose-800" onClick={() => setActiveView('mines')} />
              <GameCard title="Blackjack" color="from-zinc-100 to-zinc-300" darkText onClick={() => setActiveView('blackjack')} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-10">
            <button onClick={() => setActiveView('home')} className="flex items-center gap-2 text-white/30 hover:text-white font-black text-xs uppercase"><LayoutDashboard size={16}/> Lobby</button>
            {activeView === 'coinflip' && <div className="max-w-xl mx-auto"><Coinflip /></div>}
            {activeView === 'mines' && <div className="max-w-4xl mx-auto"><Mines /></div>}
            {activeView === 'blackjack' && <div className="max-w-3xl mx-auto"><Blackjack /></div>}
            {activeView === 'leaderboard' && <div className="max-w-2xl mx-auto"><Leaderboard /></div>}
          </div>
        )}
      </main>
    </div>
  )
}

function GameCard({ title, color, onClick, darkText = false }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -10 }} whileTap={{ scale: 0.98 }} onClick={onClick} className={`h-64 rounded-[2.5rem] bg-gradient-to-br ${color} p-8 cursor-pointer overflow-hidden shadow-2xl border-2 border-white/5 flex flex-col justify-end group`}>
       <Candy size={24} className="mb-auto text-white/20 group-hover:text-white/50 transition-colors" />
      <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${darkText ? 'text-black' : 'text-white'}`}>{title}</h3>
    </motion.div>
  )
}

export default App;