import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, User as UserIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const { data } = await chatService.getUserChats(user.id);
        setChats(data);
        if (data.length > 0) setActiveChat(data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const message = {
      senderId: user?.id,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    // Update locally UI first
    const updatedChat = {
        ...activeChat,
        messages: [...activeChat.messages, message]
    };
    setActiveChat(updatedChat);
    setChats(chats.map(c => c.id === activeChat.id ? updatedChat : c));
    setNewMessage('');

    try {
      await chatService.sendMessage(activeChat.id, message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />)}
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "w-full p-4 flex items-center gap-3 transition-colors border-b border-slate-50",
                  activeChat?.id === chat.id ? "bg-indigo-50 border-r-2 border-r-indigo-600" : "hover:bg-slate-50"
                )}
              >
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <UserIcon className="h-6 w-6 text-slate-400" />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="font-bold text-slate-900 truncate">Landlord {chat.id}</p>
                  <p className="text-xs text-slate-500 truncate italic">
                    {chat.messages[chat.messages.length - 1]?.text}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 text-sm">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {activeChat ? (
          <>
            <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-indigo-600" />
               </div>
               <div>
                  <h3 className="font-black text-slate-900">Support / Landlord</h3>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Online</p>
               </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {activeChat.messages.map((msg: any, idx: number) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                      isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none"
                    )}>
                      <p className="leading-relaxed font-medium">{msg.text}</p>
                      <span className={cn(
                        "text-[10px] mt-1 block opacity-60",
                        isMe ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 md:p-6 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="sm" className="h-11 w-11 rounded-2xl p-0">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="h-20 w-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <MessageSquareIcon className="h-10 w-10 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Select a Conversation</h2>
              <p className="text-slate-500 italic">Choose a landlord to start chatting about your next potential home.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquareIcon({className}: {className?: string}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    )
}
