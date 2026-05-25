import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, User as UserIcon, Home, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const activeChatIdFromState = location.state?.activeChatId;
  
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize socket
  useEffect(() => {
    if (!user) return;
    
    const token = localStorage.getItem('houseintel_token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const newSocket = io(API_BASE_URL, {
      auth: { token },
    });
    
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const { data } = await chatService.getUserChats();
        setChats(data.chats || []);
        
        if (data.chats?.length > 0) {
          if (activeChatIdFromState) {
            const found = data.chats.find((c: any) => c._id === activeChatIdFromState);
            if (found) setActiveChat(found);
            else setActiveChat(data.chats[0]);
          } else {
            setActiveChat(data.chats[0]);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, [user, activeChatIdFromState]);

  // Fetch messages for active chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      try {
        const { data } = await chatService.getChatMessages(activeChat._id);
        setMessages(data.messages || []);
      } catch (error) {
        console.error(error);
      }
    };
    
    if (activeChat) {
      fetchMessages();
      
      if (socket) {
        socket.emit('join_room', activeChat._id);
      }
    }
  }, [activeChat, socket]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (message: any) => {
      if (activeChat && message.chatId === activeChat._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Also update the lastMessage in chats list
      setChats((prev) => prev.map(chat => {
        if (chat._id === message.chatId) {
          return { ...chat, lastMessage: message };
        }
        return chat;
      }));
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeChat]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !socket) return;

    const receiverId = user?.id === activeChat.tenantId._id 
      ? activeChat.landlordId._id 
      : activeChat.tenantId._id;

    const messageData = {
      chatId: activeChat._id,
      receiverId,
      message: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const getOtherParticipant = (chat: any) => {
    if (user?.role === 'tenant') return chat.landlordId;
    return chat.tenantId;
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
            chats.map((chat) => {
              const otherPerson = getOtherParticipant(chat);
              return (
                <button
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={cn(
                    "w-full p-4 flex items-center gap-3 transition-colors border-b border-slate-50",
                    activeChat?._id === chat._id ? "bg-indigo-50 border-r-2 border-r-indigo-600" : "hover:bg-slate-50"
                  )}
                >
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                    {otherPerson?.profilePicture ? (
                       <img src={otherPerson.profilePicture} alt={otherPerson.name} className="w-full h-full object-cover" />
                    ) : (
                       <UserIcon className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="font-bold text-slate-900 truncate">{otherPerson?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{chat.propertyId?.title}</p>
                    <p className="text-xs text-slate-400 truncate italic mt-1">
                      {chat.lastMessage?.message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              )
            })
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
            {/* Header */}
            <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-indigo-600" />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900">{getOtherParticipant(activeChat)?.name}</h3>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{user?.role === 'tenant' ? 'Landlord' : 'Tenant'}</p>
                 </div>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Home className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 max-w-[200px] truncate">{activeChat.propertyId?.title}</span>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  This is the beginning of your conversation about {activeChat.propertyId?.title}
                </div>
              )}
              {messages.map((msg: any, idx: number) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg._id || idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                      isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    )}>
                      <p className="leading-relaxed font-medium">{msg.message}</p>
                      <span className={cn(
                        "text-[10px] mt-1 block opacity-60",
                        isMe ? "text-right" : "text-left"
                      )}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
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
              <p className="text-slate-500 italic">Choose a chat from the sidebar to view messages.</p>
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
