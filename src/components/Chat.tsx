import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../context/WalletContext';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Crown } from 'lucide-react';

export const Chat = () => {
  const { user, isOwner } = useWallet();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initial Load
    const fetchInitial = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
      if (data) setMessages(data);
    };
    fetchInitial();

    // 2. Realtime Subscription (The Fix)
    const channel = supabase.channel('realtime_chat')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          setMessages(prev => {
            // Prevent duplicates
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const content = newMessage;
    setNewMessage(''); // Clear instantly

    const { error } = await supabase.from('messages').insert([{
      user_id: user.id,
      username: user.username || user.user_metadata?.username || 'Guest',
      content: content,
      is_owner: isOwner
    }]);

    if (error) {
      console.error("Chat Error:", error);
      setNewMessage(content);
    }
  };

  return (
    <div className="bg-[#1a0505] border border-white/5 rounded-[2.5rem] flex flex-col h-[550px] shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-red-600/5">
        <div className="flex items-center gap-3">
            <MessageSquare className="text-red-500" size={18} />
            <h2 className="font-black italic uppercase tracking-widest text-xs text-white">Lobby Chat</h2>
        </div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={msg.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${msg.is_owner ? 'text-red-500' : 'text-white/30'}`}>
                {msg.is_owner && <Crown size={10} className="fill-red-500" />}
                {msg.username}
              </span>
            </div>
            <p className={`text-sm py-2.5 px-4 rounded-2xl w-fit max-w-[95%] break-words ${msg.is_owner ? 'bg-red-600 text-white font-bold border border-red-400/50 shadow-lg' : 'bg-white/5 text-white/80'}`}>
              {msg.content}
            </p>
          </motion.div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-black/40 flex gap-2">
        <input 
          type="text" 
          placeholder="Say something..." 
          className="flex-1 bg-black border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600 transition-all text-white font-medium"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-red-600 p-3 rounded-xl hover:bg-red-500 transition-colors shadow-lg active:scale-90 text-white">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};