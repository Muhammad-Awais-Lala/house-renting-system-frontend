import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentService, propertyService, bookingService, chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Send, BrainCircuit, AlertCircle, Trash2,
  TrendingUp, BarChart2, Maximize, Bed, Bath, MapPin,
  Info, LayoutGrid, RefreshCw, MessageSquare, PieChart,
  ChevronLeft, ChevronRight, Home, Calendar, CheckCircle, Star, X, MessageCircle
} from 'lucide-react';
import { Button } from '../components/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  properties?: any[];
  timestamp: Date;
}

export default function RecommendationPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // LocalStorage keys
  const LS_MESSAGES_KEY = 'houseintel_chat_messages';
  const LS_SESSION_KEY = 'houseintel_agent_session';
  const LS_RECS_KEY = 'houseintel_active_recommendations';

  const WELCOME_MESSAGE: Message = {
    id: 'welcome',
    role: 'assistant',
    content: "Hello! I am Smith, your HouseIntel AI rental assistant. Tell me what kind of property you are looking for. You can specify details like location, price range, number of bedrooms/bathrooms, or preferred amenities. For example: \"Show me 2 BHK apartments in Gulberg under 35000.\"",
    timestamp: new Date()
  };

  // Chat state — initialized from localStorage
  const [sessionId, setSessionId] = useState<string>(() => {
    const stored = localStorage.getItem(LS_SESSION_KEY);
    if (stored) return stored;
    const newSid = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(LS_SESSION_KEY, newSid);
    return newSid;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(LS_MESSAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<any>;
        // Rehydrate timestamps from ISO strings back to Date objects
        return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {
      /* ignore parse errors */
    }
    return [WELCOME_MESSAGE];
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>('');

  // Active recommendations (from the last response) — initialized from localStorage
  const [activeRecommendations, setActiveRecommendations] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem(LS_RECS_KEY);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
  });

  // Market analytics state (database aggregation)
  const [marketProperties, setMarketProperties] = useState<any[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(true);

  // Selected Property for Details
  const { user } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedReviews, setSelectedReviews] = useState<any[]>([]);
  const [isLoadingProperty, setIsLoadingProperty] = useState<boolean>(false);
  const [propertyError, setPropertyError] = useState<string>('');

  // Carousel state for selected property images
  const [currentImg, setCurrentImg] = useState<number>(0);

  // Booking Flow State inside details
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [isBooked, setIsBooked] = useState<boolean>(false);
  const [bookingData, setBookingData] = useState({
    moveInDate: '',
    duration: '6 Months',
    numberOfOccupants: 1,
    messageToLandlord: '',
  });

  // Chat initiation with landlord
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const handleSelectProperty = async (propId: string) => {
    try {
      setIsLoadingProperty(true);
      setPropertyError('');
      setSelectedProperty(null);
      setSelectedReviews([]);
      setIsBooked(false);
      
      const response = await propertyService.getById(propId);
      setSelectedProperty(response.data.property);
      setSelectedReviews(response.data.reviews || []);
      setCurrentImg(0);
    } catch (err: any) {
      console.error("Failed to fetch property details:", err);
      setPropertyError(err.response?.data?.message || 'Failed to load property details.');
    } finally {
      setIsLoadingProperty(false);
    }
  };

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    if (!bookingData.moveInDate || !bookingData.duration) {
      setPropertyError('Please select move-in date and duration');
      return;
    }
    setIsBooking(true);
    try {
      await bookingService.create({
        propertyId: selectedProperty._id || selectedProperty.id,
        moveInDate: bookingData.moveInDate,
        duration: bookingData.duration,
        numberOfOccupants: bookingData.numberOfOccupants,
        messageToLandlord: bookingData.messageToLandlord,
      });
      setIsBooked(true);
      setShowBookingModal(false);
      setPropertyError('');
    } catch (err: any) {
      setPropertyError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const handleChat = async () => {
    if (!user) { navigate('/login'); return; }
    const propLandlordId = typeof selectedProperty.landlordId === 'object' ? selectedProperty.landlordId._id : selectedProperty.landlordId;
    if (user.id === propLandlordId || user._id === propLandlordId) {
      setPropertyError('Landlords cannot initiate chats with themselves.');
      return;
    }

    setIsChatLoading(true);
    try {
      const res = await chatService.createOrGetChat(selectedProperty._id || selectedProperty.id, propLandlordId);
      if (res.data.success) {
        navigate('/messages', { state: { activeChatId: res.data.chat._id } });
      }
    } catch (err: any) {
      setPropertyError(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LS_MESSAGES_KEY, JSON.stringify(messages));
    } catch { /* quota exceeded — silently ignore */ }
  }, [messages]);

  // Persist active recommendations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LS_RECS_KEY, JSON.stringify(activeRecommendations));
    } catch { /* ignore */ }
  }, [activeRecommendations]);

  // Load Market Properties on Mount
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const fetchMarketData = async () => {
    try {
      setIsLoadingMarket(true);
      const { data } = await propertyService.getAll({ limit: 100 });
      setMarketProperties(data.properties || []);
    } catch (err) {
      console.error("Failed to load market properties for analytics:", err);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  // Chat message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setChatError('');
    setIsSending(true);

    // Add user message to log
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // API call to FastAPI localhost:8000
      const response = await agentService.chat(userMessageText, sessionId);
      const data = response.data;

      // Add assistant response to log
      const assistantMsg: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.message || "I couldn't process that. Let me look for matching properties.",
        properties: data.properties || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If properties are returned, update active recommendations
      if (data.properties && data.properties.length > 0) {
        setActiveRecommendations(data.properties);
      }
    } catch (err: any) {
      console.error("Agent chat request failed:", err);
      setChatError(
        err.response?.data?.detail ||
        "Failed to reach the recommendation assistant. Please make sure the Agent API is running on localhost:8000."
      );
    } finally {
      setIsSending(false);
    }
  };

  // Reset chat session
  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear this conversation history?")) {
      try {
        if (sessionId) {
          await agentService.deleteSession(sessionId);
        }
      } catch (err) {
        console.warn("Could not delete session on server:", err);
      }

      // Re-initialize local session
      const newSid = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(LS_SESSION_KEY, newSid);
      setSessionId(newSid);

      // Clear localStorage chat data
      localStorage.removeItem(LS_MESSAGES_KEY);
      localStorage.removeItem(LS_RECS_KEY);

      // Reset states
      const freshWelcome: Message = {
        id: 'welcome',
        role: 'assistant',
        content: "Conversation history cleared! Let's start fresh. What type of renting properties are you searching for today?",
        timestamp: new Date()
      };
      setMessages([freshWelcome]);
      setInputValue('');
      setChatError('');
      setActiveRecommendations([]);
      setSelectedProperty(null);
    }
  };

  // Custom text formatter for chatbot markdown-like content (supports bolding and bullet lists)
  const formatMessageContent = (text: string) => {
    if (!text) return null;

    // Strip bare URLs (http/https links) and markdown image syntax from the text
    // so internal image links and cloudinary URLs are never shown to users.
    const cleanText = text
      // Remove markdown images: ![alt](url)
      .replace(/!\[.*?\]\(https?:\/\/\S+\)/g, '')
      // Remove markdown links that are just bare URLs: [url](url) or [text](url)
      .replace(/\[.*?\]\(https?:\/\/\S+\)/g, '')
      // Remove bare URLs (standalone http/https links, possibly preceded by spaces/dashes)
      .replace(/(^|\s)(https?:\/\/\S+)/gm, '')
      // Clean up lines that become empty after stripping
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');

    const lines = cleanText.split('\n');
    return lines.map((line, idx) => {
      // Render unordered lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="list-disc ml-5 mt-1 text-slate-700 text-sm leading-relaxed">
            {renderBoldedText(content)}
          </li>
        );
      }

      // Render numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="list-decimal ml-5 mt-1 text-slate-700 text-sm leading-relaxed">
            {renderBoldedText(numMatch[2])}
          </li>
        );
      }

      // Render standard paragraph
      return (
        <p key={idx} className="mt-2 text-slate-700 text-sm md:text-base leading-relaxed first:mt-0">
          {renderBoldedText(line)}
        </p>
      );
    });
  };


  // Sub-renderer to find **bold** tags and style them cleanly
  const renderBoldedText = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-indigo-900 bg-indigo-50/70 px-1.5 py-0.5 rounded text-sm">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper stats extraction from market properties database
  const getMarketStats = () => {
    if (!marketProperties || marketProperties.length === 0) return { locationStats: [], typeStats: [], avgRent: 0 };

    // Average Rent
    const prices = marketProperties.map(p => p.price).filter(Boolean);
    const avgRent = prices.reduce((acc, curr) => acc + curr, 0) / (prices.length || 1);

    // Average price by Location
    const locMap: Record<string, { total: number; count: number }> = {};
    marketProperties.forEach(p => {
      if (p.location && p.price) {
        const loc = p.location.trim();
        if (!locMap[loc]) locMap[loc] = { total: 0, count: 0 };
        locMap[loc].total += p.price;
        locMap[loc].count += 1;
      }
    });
    const locationStats = Object.keys(locMap).map(loc => ({
      location: loc,
      avgPrice: locMap[loc].total / locMap[loc].count,
      count: locMap[loc].count
    })).sort((a, b) => b.avgPrice - a.avgPrice).slice(0, 5);

    // Property Type Distribution
    const typeMap: Record<string, number> = {};
    marketProperties.forEach(p => {
      if (p.propertyType) {
        const type = p.propertyType.trim();
        typeMap[type] = (typeMap[type] || 0) + 1;
      }
    });
    const totalCount = marketProperties.length;
    const typeStats = Object.keys(typeMap).map(type => ({
      type,
      count: typeMap[type],
      percentage: (typeMap[type] / totalCount) * 100
    })).sort((a, b) => b.count - a.count);

    return { locationStats, typeStats, avgRent };
  };

  const { locationStats, typeStats, avgRent } = getMarketStats();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

      {/* Visual Hub Header banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 -mr-6 -mt-6">
          <BrainCircuit className="h-44 w-44" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest mb-3">
              <Sparkles className="h-3 w-3 text-amber-300" />
              INTELLIGENT RECOMMENDATION HUB
            </div>
            <h1 className="text-3xl font-black tracking-tight leading-none mb-1">
              AI Properties Co-Pilot
            </h1>
            <p className="text-indigo-100 text-sm opacity-80">
              Interactive chat discovery powered by custom LLM matching, paired with real-time rental dashboard insights.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              id="clear-chat-btn-top"
              onClick={handleClearChat}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all px-4 py-2.5 rounded-xl text-xs font-bold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Reset Agent Memory
            </button>
          </div>
        </div>
      </div>

      {/* Main split-pane content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[680px]">

        {/* ================= LEFT COLUMN: CHAT WINDOW ================= */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden h-[550px] lg:h-full">

          {/* Chat header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  Smith (HouseIntel Agent)
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Online Assistant</span>
              </div>
            </div>
            {messages.length > 1 && (
              <button
                id="clear-chat-btn-header"
                onClick={handleClearChat}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Clear chat thread"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Avatar */}
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <BrainCircuit className="h-4.5 w-4.5" />
                  </div>
                )}

                <div className="flex flex-col max-w-[85%] sm:max-w-[75%] space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                      }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-3">
                        <div>{formatMessageContent(msg.content)}</div>
                        {console.log(msg.content)}
                      </div>
                    )}
                  </div>

                  {/* Recommendations Cards rendered directly inside the chat thread */}
                  {msg.role === 'assistant' && msg.properties && msg.properties.length > 0 && (
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-widest px-1">
                        <Sparkles className="h-3 w-3" /> Matches Discovered ({msg.properties.length})
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {msg.properties.map((property) => {
                          const propId = property.id || property._id;
                          const imageUrl = property.images?.[0] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='%23f1f5f9'%3E%3Crect width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E";
                          return (
                            <div
                              key={propId}
                              id={`chat-prop-${propId}`}
                              onClick={() => handleSelectProperty(propId)}
                              className="flex gap-3 bg-white hover:bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-xl p-2.5 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden group"
                            >
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                <img
                                  src={imageUrl}
                                  alt={property.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-1 right-1 bg-indigo-600/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                                  Rs {property.price}
                                </div>
                              </div>
                              <div className="flex flex-col justify-between flex-1 min-w-0">
                                <div>
                                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-tight group-hover:text-indigo-600 transition-colors truncate">
                                    {property.title}
                                  </h4>
                                  <p className="text-slate-400 text-[10px] flex items-center gap-0.5 mt-0.5 truncate">
                                    <MapPin className="h-2.5 w-2.5 text-slate-400" />
                                    {property.location}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  {property.propertyType && (
                                    <span className="text-[8px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded uppercase">
                                      {property.propertyType}
                                    </span>
                                  )}
                                  {property.bedrooms !== undefined && (
                                    <span className="text-[8px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <Bed className="h-2.5 w-2.5 text-slate-400" /> {property.bedrooms}
                                    </span>
                                  )}
                                  {property.bathrooms !== undefined && (
                                    <span className="text-[8px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <Bath className="h-2.5 w-2.5 text-slate-400" /> {property.bathrooms}
                                    </span>
                                  )}
                                  {property.propertySize && (
                                    <span className="text-[8px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <Maximize className="h-2.5 w-2.5 text-slate-400" /> {property.propertySize} sqft
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <span className={`text-[9px] text-slate-400 font-medium px-1 mt-0.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {isSending && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <BrainCircuit className="h-4.5 w-4.5 animate-spin text-indigo-500" />
                </div>
                <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <span className="text-xs font-semibold">Smith is checking listings...</span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}

            {/* Error notifications */}
            {chatError && (
              <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="flex-1 font-semibold">{chatError}</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat input form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 items-center flex-shrink-0"
          >
            <input
              id="agent-chat-input"
              type="text"
              placeholder="Ask about location, price, bedroom count..."
              className="flex-1 bg-white border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-2xl px-4 py-3 text-sm text-slate-800 font-semibold shadow-inner outline-none placeholder:text-slate-400"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSending}
              autoComplete="off"
            />
            <Button
              id="agent-chat-send-btn"
              type="submit"
              className="rounded-2xl w-12 h-11 flex items-center justify-center p-0"
              isLoading={isSending}
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

        </div>

        {/* ================= RIGHT COLUMN: ANALYTICS, CHARTS & PROPERTY DETAILS ================= */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-100 p-6 shadow-xl h-full overflow-y-auto">

          {isLoadingProperty ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 my-auto">
              <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Property Details...</span>
            </div>
          ) : selectedProperty ? (
            (() => {
              const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' fill='%23f1f5f9'%3E%3Crect width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
              const imageUrls: string[] = (selectedProperty.images || [])
                .map((img: any) => (typeof img === 'string' ? img : img?.url))
                .filter(Boolean);
              const displayImages = imageUrls.length > 0 ? imageUrls : [fallback];

              return (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Header / Back bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-850 uppercase tracking-wider transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Market Trends
                    </button>
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Error notifications */}
                  {propertyError && (
                    <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs">
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <div className="flex-1 font-semibold">{propertyError}</div>
                    </div>
                  )}

                  {/* Images Carousel */}
                  <div className="space-y-2">
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-50">
                      <img
                        src={displayImages[currentImg]}
                        alt={selectedProperty.title}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (!img.dataset.fallback) {
                            img.dataset.fallback = '1';
                            img.src = fallback;
                          }
                        }}
                      />
                      {displayImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImg((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-1.5 hover:bg-white transition-colors shadow-sm"
                          >
                            <ChevronLeft className="h-4 w-4 text-indigo-600" />
                          </button>
                          <button
                            onClick={() => setCurrentImg((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 rounded-full p-1.5 hover:bg-white transition-colors shadow-sm"
                          >
                            <ChevronRight className="h-4 w-4 text-indigo-600" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {displayImages.length > 1 && (
                      <div className="grid grid-cols-5 gap-1.5">
                        {displayImages.map((url: string, i: number) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-lg overflow-hidden border cursor-pointer ${
                              i === currentImg ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'
                            }`}
                            onClick={() => setCurrentImg(i)}
                          >
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (!img.dataset.fallback) {
                                  img.dataset.fallback = '1';
                                  img.src = fallback;
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title & Stats */}
                  <div>
                    <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-[10px] uppercase tracking-wider mb-2">
                      <Home className="h-3.5 w-3.5" />
                      {selectedProperty.propertyType} Rental
                    </div>
                    <h2 className="text-xl font-black text-slate-800 leading-snug">
                      {selectedProperty.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-slate-500 text-xs">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                        {selectedProperty.location}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Maximize className="h-3.5 w-3.5 text-indigo-500" />
                        {selectedProperty.propertySize} {selectedProperty.sizeUnit || 'sqft'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Bed className="h-3.5 w-3.5 text-indigo-500" />
                        {selectedProperty.bedrooms} Beds
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Bath className="h-3.5 w-3.5 text-indigo-500" />
                        {selectedProperty.bathrooms} Baths
                      </span>
                      {selectedProperty.averageRating > 0 && (
                        <span className="flex items-center gap-1 font-semibold">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {selectedProperty.averageRating.toFixed(1)} ({selectedProperty.totalReviews})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Primary Call to Actions */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/20 rounded-full blur-2xl -mr-12 -mt-12" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block relative z-10">
                      Monthly Rent
                    </span>
                    <div className="flex items-baseline gap-1 mt-1 relative z-10">
                      <span className="text-3xl font-black">Rs {selectedProperty.price}</span>
                      <span className="text-slate-400 font-bold text-xs">/ month</span>
                    </div>
                    <div className="mt-5 relative z-10 flex flex-col gap-2.5">
                      <Button
                        className="w-full rounded-xl py-3 bg-white text-slate-900 hover:bg-slate-100 font-black h-11 text-xs"
                        onClick={() => {
                          if (!user) navigate('/login');
                          else setShowBookingModal(true);
                        }}
                        isLoading={isBooking}
                        disabled={isBooked}
                      >
                        {isBooked ? (
                          <>
                            <CheckCircle className="mr-1.5 h-4 w-4 text-emerald-600" />
                            REQUESTED
                          </>
                        ) : (
                          <>
                            <Calendar className="mr-1.5 h-4 w-4" />
                            BOOK VISIT
                          </>
                        )}
                      </Button>
                      {(!user || user.role === 'tenant') && (
                        <Button
                          className="w-full rounded-xl py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black h-11 text-xs border-none"
                          onClick={handleChat}
                          isLoading={isChatLoading}
                        >
                          <MessageCircle className="mr-1.5 h-4 w-4" />
                          CHAT WITH LANDLORD
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-indigo-600" />
                      About this property
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-xs italic bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                      "{selectedProperty.description}"
                    </p>
                  </div>

                  {/* Amenities */}
                  {selectedProperty.amenities?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Amenities
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProperty.amenities.map((a: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100/50 capitalize"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  {selectedReviews.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Guest Reviews
                      </h3>
                      <div className="space-y-3">
                        {selectedReviews.slice(0, 3).map((review: any) => (
                          <div key={review._id} className="p-3.5 border border-slate-200 rounded-xl bg-white text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.isVerifiedTenant && (
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[8px] font-bold rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1">{review.title}</h4>
                            <p className="text-slate-500 leading-normal">{review.comment}</p>
                            <p className="text-[9px] text-slate-400 mt-2 font-medium">
                              by {review.tenantId?.firstName} {review.tenantId?.lastName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="space-y-6 flex-1 flex flex-col animate-in fade-in duration-300">

              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                  Renting Market Intelligence
                </h3>
                <p className="text-xs text-slate-400">Aggregated statistics calculated directly from active rental listings database.</p>
              </div>

              {isLoadingMarket ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compiling Analytics Data...</span>
                </div>
              ) : marketProperties.length === 0 ? (
                <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl">
                  <Info className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold">No rental listings database found.</p>
                  <p className="text-xs text-slate-400 mt-1">Publish property listings as Landlord to inspect charts.</p>
                </div>
              ) : (
                <div className="space-y-6">

                  {/* Summary Metric Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 p-5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-wider block">Average Market Rent</span>
                      <span className="text-2xl font-black text-indigo-900 mt-1 block">Rs {Math.round(avgRent).toLocaleString()}/mo</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100/30">
                      <LayoutGrid className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>

                  {/* Horizontal Bar Chart: Price by Location */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                      Rent Trend by Location (Average Price)
                    </h4>

                    <div className="space-y-3.5 bg-slate-50/50 p-4.5 border border-slate-100 rounded-2xl">
                      {locationStats.map((loc) => {
                        const maxVal = Math.max(...locationStats.map(l => l.avgPrice), 1);
                        const percentage = (loc.avgPrice / maxVal) * 100;
                        return (
                          <div key={loc.location} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                              <span className="truncate max-w-[200px]">{loc.location}</span>
                              <span className="text-indigo-600">Rs {Math.round(loc.avgPrice).toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Type Distribution Metric cards */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <PieChart className="h-3.5 w-3.5 text-indigo-500" />
                      Property Types Breakdown
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      {typeStats.slice(0, 4).map((stat) => (
                        <div
                          key={stat.type}
                          className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
                        >
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate block">
                            {stat.type}s
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-xl font-black text-slate-800">{stat.count}</span>
                            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                              {Math.round(stat.percentage)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Booking modal */}
      {showBookingModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">Book Visit Request</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Move-in Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={bookingData.moveInDate}
                  onChange={(e) => setBookingData({ ...bookingData, moveInDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Duration</label>
                <select
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={bookingData.duration}
                  onChange={(e) => setBookingData({ ...bookingData, duration: e.target.value })}
                >
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Number of Occupants</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={bookingData.numberOfOccupants}
                  onChange={(e) => setBookingData({ ...bookingData, numberOfOccupants: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Message to Landlord (Optional)</label>
                <textarea
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  rows={3}
                  placeholder="Introduce yourself to the landlord..."
                  value={bookingData.messageToLandlord}
                  onChange={(e) => setBookingData({ ...bookingData, messageToLandlord: e.target.value })}
                />
              </div>
              {propertyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold">
                  {propertyError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleBooking} isLoading={isBooking}>
                  Confirm Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
