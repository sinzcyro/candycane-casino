import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Crown, Info, Users, Sparkles } from 'lucide-react';

export const About = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-12 pb-20 max-w-4xl mx-auto"
    >
      {/* HEADER section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 font-black text-xs uppercase tracking-[0.3em]">
          <Info size={14} /> The Manifesto
        </div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
          THE SWEETEST <br /> <span className="text-red-600">THRILL.</span>
        </h1>
      </div>

      {/* MISSION section */}
      <div className="bg-[#1a0505] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black italic uppercase text-white flex items-center gap-3">
            <Sparkles className="text-red-600" /> What is CandyCane?
          </h2>
          <p className="text-white/70 leading-relaxed text-lg font-medium">
            CandyCane isn’t just another gambling site; it’s a high-octane social ecosystem built for those who crave the adrenaline of the win. We’ve combined the aesthetics of a premium candy shop with the cut-throat energy of a Las Vegas high-roller lounge. 
          </p>
          <p className="text-white/70 leading-relaxed text-lg font-medium">
            Every drop in <span className="text-white font-bold">Plinko</span>, every climb in <span className="text-white font-bold">Stack</span>, and every flip of the <span className="text-white font-bold">Coin</span> is powered by our proprietary <span className="text-red-500 font-bold uppercase italic">Provably Fair Engine</span>. No hidden house tricks—just pure, cryptographically secure randomness.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <img src="/candycane.png" className="w-64" alt="" />
        </div>
      </div>

      {/* THE OWNER section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-red-600 to-rose-900 p-8 rounded-[3rem] shadow-xl flex flex-col justify-between h-64 border-4 border-white/10">
          <div>
            <Crown size={40} className="text-white mb-4 drop-shadow-lg" />
            <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">THE MASTERMIND</h3>
          </div>
          <p className="text-white font-black text-2xl uppercase tracking-widest italic">OWNER: CANE</p>
        </div>

        <div className="bg-black/40 p-8 rounded-[3rem] border border-white/5 space-y-4">
          <h3 className="text-xl font-black italic uppercase text-red-500">The Vision</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            "I wanted to build a place where the community comes first. CandyCane was designed to give players the world-class casino experience using fake currency, where your skill and luck on the leaderboard define your status. This is the Laboratory. This is my house."
            <br /><br />
            <span className="text-white font-bold italic">— CANE</span>
          </p>
        </div>
      </div>

      {/* STATS/FEATURES grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <AboutCard 
            icon={<ShieldCheck className="text-red-500" />} 
            title="SECURE" 
            desc="CSPRNG Randomness for 100% fair outcomes." 
        />
        <AboutCard 
            icon={<Heart className="text-red-500" />} 
            title="SOCIAL" 
            desc="Transfer candy to friends and dominate the ranks." 
        />
        <AboutCard 
            icon={<Users className="text-red-500" />} 
            title="ELITE" 
            desc="Join thousands of players in the global elite." 
        />
      </div>

      {/* FOOTER CALL TO ACTION */}
      <div className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Established 2025 • CandyCane Group • All Rights Reserved</p>
      </div>
    </motion.div>
  );
};

const AboutCard = ({ icon, title, desc }: any) => (
    <div className="bg-[#1a0505] p-6 rounded-3xl border border-white/5 space-y-2">
        <div className="flex justify-center mb-2">{icon}</div>
        <h4 className="font-black text-white italic">{title}</h4>
        <p className="text-white/40 text-xs">{desc}</p>
    </div>
);