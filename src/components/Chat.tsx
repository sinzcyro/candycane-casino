import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Crown } from 'lucide-react';

export const Chat = () => {
  const { user, isOwner } = useWallet();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages in real-time
    const channel = supabase.channel('global_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new].slice(-50)); // Keep last 50
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msg = {
      user_id: user.id,
      username: user.username,
      content: newMessage,
      is_owner: isOwner
    };

    setNewMessage('');
    const { error } = await supabase.from('messages').insert([msg]);
    if (error) console.error(error);
  };

  return (
    <div className="bg-[#1a0505] border border-white/5 rounded-[2.5rem] flex flex-col h-[600px] shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-red-600/5">
        <MessageSquare className="text-red-500" size={20} />
        <h2 className="font-black italic uppercase tracking-tighter text-white">Global Chat</h2>
      </div>

      {/* Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }} 
            key={msg.id} 
            className="flex flex-col group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${msg.is_owner ? 'text-red-500' : 'text-white/40'}`}>
                {msg.is_owner && <Crown size={10} className="fill-red-500" />}
                {msg.username}
              </span>
              <span className="text-[8px] text-white/10 font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className={`text-sm py-2 px-4 rounded-2xl w-fit max-w-[90%] break-words ${msg.is_owner ? 'bg-red-600 text-white font-bold border border-red-400/50' : 'bg-white/5 text-white/80'}`}>
              {msg.content}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          placeholder="Say something sweet..." 
          className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600 transition-all font-medium"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-red-600 p-3 rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 active:scale-90">
          <Send size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
};