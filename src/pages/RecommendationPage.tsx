import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentService, propertyService } from '../services/api';
import { 
  Sparkles, Send, BrainCircuit, AlertCircle, Trash2, 
  TrendingUp, BarChart2, Maximize, Bed, Bath, MapPin, 
  Info, LayoutGrid, RefreshCw, MessageSquare, PieChart
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
  
  // Chat state
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>('');
  
  // Active recommendations (from the last response)
  const [activeRecommendations, setActiveRecommendations] = useState<any[]>([]);

  // Market analytics state (database aggregation)
  const [marketProperties, setMarketProperties] = useState<any[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(true);
  
  // UI Tabs / Dashboard view state
  const [activeTab, setActiveTab] = useState<'recommendations' | 'market'>('market');
  const [hoveredProperty, setHoveredProperty] = useState<any>(null);

  // Initialize Session & Load Market Properties on Mount
  useEffect(() => {
    // Generate or retrieve session ID
    let sid = sessionStorage.getItem('houseintel_agent_session');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('houseintel_agent_session', sid);
    }
    setSessionId(sid);

    // Initial Welcome Message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I am Smith, your HouseIntel AI rental assistant. Tell me what kind of property you are looking for. You can specify details like location, price range, number of bedrooms/bathrooms, or preferred amenities. For example: \"Show me 2 BHK apartments in Gulberg under 35000.\"",
        timestamp: new Date()
      }
    ]);

    // Fetch whole database properties for general market analytics
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

      // If properties are returned, update active recommendations & automatically focus the analytics tab
      if (data.properties && data.properties.length > 0) {
        setActiveRecommendations(data.properties);
        setActiveTab('recommendations');
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
      sessionStorage.setItem('houseintel_agent_session', newSid);
      setSessionId(newSid);

      // Reset states
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Conversation history cleared! Let's start fresh. What type of renting properties are you searching for today?",
          timestamp: new Date()
        }
      ]);
      setInputValue('');
      setChatError('');
      setActiveRecommendations([]);
      setActiveTab('market');
    }
  };

  // Custom text formatter for chatbot markdown-like content (supports bolding and bullet lists)
  const formatMessageContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
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
                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white font-medium rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-3">
                        <div>{formatMessageContent(msg.content)}</div>
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
                              onClick={() => navigate(`/properties/${propId}`)}
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

        {/* ================= RIGHT COLUMN: ANALYTICS & CHARTS ================= */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-100 p-6 shadow-xl h-full overflow-y-auto">
          
          {/* Tab Selector */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-6 flex-shrink-0">
            <button
              id="tab-btn-market"
              onClick={() => setActiveTab('market')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'market' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              General Market Trends
            </button>
            <button
              id="tab-btn-recs"
              onClick={() => {
                if (activeRecommendations.length > 0) {
                  setActiveTab('recommendations');
                }
              }}
              disabled={activeRecommendations.length === 0}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeRecommendations.length === 0 
                  ? 'opacity-40 cursor-not-allowed text-slate-400' 
                  : activeTab === 'recommendations' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Search Insights ({activeRecommendations.length})
            </button>
          </div>

          {/* ACTIVE TAB: SEARCH RECOMMENDATIONS INSIGHTS */}
          {activeTab === 'recommendations' && activeRecommendations.length > 0 && (
            <div className="space-y-6 flex-1 flex flex-col animate-in fade-in duration-300">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <BarChart2 className="h-4.5 w-4.5 text-indigo-600" />
                  Price Analysis (Rent/Month)
                </h3>
                <p className="text-xs text-slate-400">Comparing prices of recommendations returned by the AI agent.</p>
              </div>

              {/* Price comparison Bar Chart */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                <svg width="100%" height="180" viewBox="0 0 340 180" className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1="45" y1="20" x2="330" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="45" y1="75" x2="330" y2="75" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="45" y1="130" x2="330" y2="130" stroke="#cbd5e1" />

                  {/* Axis Text */}
                  <text x="35" y="24" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">Max</text>
                  <text x="35" y="79" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">Mid</text>
                  <text x="35" y="134" textAnchor="end" className="text-[9px] fill-slate-400 font-bold">0</text>

                  {/* Draw Bars */}
                  {(() => {
                    const prices = activeRecommendations.map(p => p.price);
                    const maxVal = Math.max(...prices, 1000);
                    const chartAreaHeight = 110; // height from y=20 to y=130
                    const barGap = 12;
                    const totalBarsWidth = 285;
                    const barWidth = Math.max(15, (totalBarsWidth / activeRecommendations.length) - barGap);

                    return activeRecommendations.map((p, idx) => {
                      const barHeight = (p.price / maxVal) * chartAreaHeight;
                      const x = 50 + idx * (barWidth + barGap);
                      const y = 130 - barHeight;

                      const isHovered = hoveredProperty?.id === (p.id || p._id);

                      return (
                        <g 
                          key={p.id || p._id}
                          onMouseEnter={() => setHoveredProperty(p)}
                          onMouseLeave={() => setHoveredProperty(null)}
                          onClick={() => navigate(`/properties/${p.id || p._id}`)}
                          className="cursor-pointer"
                        >
                          {/* Animated Highlight bar */}
                          <rect 
                            x={x} 
                            y={y} 
                            width={barWidth} 
                            height={barHeight} 
                            rx="4" 
                            className={`transition-all duration-300 ${
                              isHovered ? 'fill-indigo-600' : 'fill-indigo-400'
                            }`}
                          />
                          {/* Tooltip price over bar */}
                          <text 
                            x={x + barWidth / 2} 
                            y={y - 6} 
                            textAnchor="middle" 
                            className={`text-[9px] font-black transition-all ${
                              isHovered ? 'fill-indigo-700 font-black' : 'fill-slate-500'
                            }`}
                          >
                            {p.price >= 1000 ? `${(p.price/1000).toFixed(1)}k` : p.price}
                          </text>
                          {/* Bottom X labels */}
                          <text 
                            x={x + barWidth / 2} 
                            y="145" 
                            textAnchor="middle" 
                            className={`text-[8px] font-bold fill-slate-400 w-12 truncate`}
                          >
                            {p.title.length > 8 ? p.title.slice(0, 8) + '..' : p.title}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>

                {/* Hover details display */}
                <div className="h-12 w-full mt-2 border-t border-slate-100 pt-2 flex items-center justify-center">
                  {hoveredProperty ? (
                    <div className="text-center">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase mr-2">
                        {hoveredProperty.location}
                      </span>
                      <span className="text-xs font-bold text-slate-700 truncate inline-block max-w-[200px] align-middle">
                        {hoveredProperty.title}
                      </span>
                      <span className="text-xs font-black text-indigo-600 ml-2">
                        Rs {hoveredProperty.price}/mo
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Hover over the chart bars to inspect property details</span>
                  )}
                </div>
              </div>

              {/* Property Sizes vs Price Scatter Plot */}
              <div className="border-b border-slate-100 pb-2 pt-2">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Maximize className="h-4 w-4 text-purple-600" />
                  Price vs Size Correlation
                </h3>
                <p className="text-xs text-slate-400">Y-Axis: Price (Rs) | X-Axis: Square footage (sqft)</p>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                <svg width="100%" height="160" viewBox="0 0 340 160" className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1="45" y1="15" x2="330" y2="15" stroke="#f1f5f9" />
                  <line x1="45" y1="65" x2="330" y2="65" stroke="#f1f5f9" />
                  <line x1="45" y1="115" x2="330" y2="115" stroke="#cbd5e1" />
                  
                  {/* Scatter axis tags */}
                  <text x="35" y="20" textAnchor="end" className="text-[8px] fill-slate-400 font-bold">High Price</text>
                  <text x="35" y="119" textAnchor="end" className="text-[8px] fill-slate-400 font-bold">Low Price</text>
                  <text x="45" y="132" textAnchor="middle" className="text-[8px] fill-slate-400 font-bold">Small Size</text>
                  <text x="330" y="132" textAnchor="end" className="text-[8px] fill-slate-400 font-bold">Large Size</text>

                  {/* Draw Scatter Dots */}
                  {(() => {
                    const sizes = activeRecommendations.map(p => Number(p.propertySize) || 500);
                    const prices = activeRecommendations.map(p => p.price);
                    
                    const minSz = Math.min(...sizes, 300);
                    const maxSz = Math.max(...sizes, 2500);
                    const minPr = Math.min(...prices, 1000);
                    const maxPr = Math.max(...prices, 10000);

                    const xRange = maxSz - minSz || 1;
                    const yRange = maxPr - minPr || 1;

                    return activeRecommendations.map((p) => {
                      const sizeVal = Number(p.propertySize) || 500;
                      const priceVal = p.price;

                      // Map coordinates to SVG bounding box: X from 60 to 310, Y from 25 to 110
                      const xCoord = 60 + ((sizeVal - minSz) / xRange) * 240;
                      const yCoord = 110 - ((priceVal - minPr) / yRange) * 85;

                      const isHovered = hoveredProperty?.id === (p.id || p._id);

                      return (
                        <g 
                          key={p.id || p._id}
                          onMouseEnter={() => setHoveredProperty(p)}
                          onMouseLeave={() => setHoveredProperty(null)}
                          onClick={() => navigate(`/properties/${p.id || p._id}`)}
                          className="cursor-pointer"
                        >
                          <circle 
                            cx={xCoord} 
                            cy={yCoord} 
                            r={isHovered ? 10 : 7} 
                            className={`transition-all duration-300 stroke-2 stroke-white ${
                              isHovered ? 'fill-indigo-600' : 'fill-purple-500'
                            }`}
                          />
                          {isHovered && (
                            <text 
                              x={xCoord} 
                              y={yCoord - 14} 
                              textAnchor="middle" 
                              className="text-[8px] font-black fill-slate-700 bg-white"
                            >
                              {sizeVal} sqft / Rs {priceVal}
                            </text>
                          )}
                        </g>
                      );
                    });
                  })()}
                </svg>
              </div>

            </div>
          )}

          {/* ACTIVE TAB: GENERAL MARKET ANALYTICS */}
          {(activeTab === 'market' || activeRecommendations.length === 0) && (
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

    </div>
  );
}
