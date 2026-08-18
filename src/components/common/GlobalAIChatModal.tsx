import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { TravelWiseLogo } from './TravelWiseLogo';
import {
  Send,
  X,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  Compass,
  MapPin,
  Calendar,
  Wallet,
  CornerDownLeft,
} from 'lucide-react';
import { apiAIChat } from '../../services/api';
import { useTrip } from '../../contexts/TripContext';

interface GlobalAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedTrip?: {
    destination: string;
    durationDays?: number;
    estimatedBudget?: string;
  };
}

const STARTER_PROMPTS = [
  '🌴 Plan a 4-day relaxing Goa getaway with quiet beaches',
  '☕ Suggest a 5-day misty tea estate tour in Kerala & Munnar',
  '🏰 Recommend a budget-friendly heritage itinerary in Rajasthan',
  '🏔️ What is the best month and route to visit Darjeeling?',
];

export const GlobalAIChatModal: React.FC<GlobalAIChatModalProps> = ({ isOpen, onClose }) => {
  const { currentTrip } = useTrip();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-global',
      sender: 'assistant',
      text: "Namaste! I'm your TravelWise AI Travel Assistant. How can I assist your travels across India today? You can ask me to plan a custom trip, recommend hidden gems, optimize a budget, or find local culinary spots.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputMessage.trim();
    if (!text || isSending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      // Build history
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await apiAIChat.sendMessage({
        tripId: currentTrip?.id,
        userMessage: text,
        history: historyPayload,
      });

      // Check if response mentions a specific Indian destination to offer a quick plan action
      let suggestedDestination: string | undefined;
      const lower = (text + ' ' + res.message).toLowerCase();
      const possibleCities = ['goa', 'kerala', 'jaipur', 'darjeeling', 'ladakh', 'varanasi', 'munnar', 'udaipur', 'manali', 'rishikesh', 'ooty', 'shimla', 'coorg', 'hampi'];
      for (const city of possibleCities) {
        if (lower.includes(city)) {
          suggestedDestination = city.charAt(0).toUpperCase() + city.slice(1);
          break;
        }
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        timestamp: res.timestamp || new Date().toISOString(),
        suggestedTrip: suggestedDestination ? { destination: suggestedDestination } : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I'm experiencing a brief connectivity hiccup, but you can jump right into our custom Itinerary Builder to plan your dream trip step by step!",
          timestamp: new Date().toISOString(),
          suggestedTrip: { destination: 'India' },
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateTripFromPrompt = (destination: string) => {
    onClose();
    navigate(`/create-trip?destination=${encodeURIComponent(destination)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full sm:max-w-2xl h-[90vh] sm:h-[650px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-[#FAFAF8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <TravelWiseLogo variant="emblem" size="xs" theme="dark" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span>TravelWise Assistant</span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Live AI Concierge
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-light">
                    Context-aware travel intelligence for India
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Starters Carousel */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isSending}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 whitespace-nowrap transition-colors shadow-2xs shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white font-normal rounded-br-xs shadow-xs'
                          : 'bg-[#FAFAF8] text-slate-800 font-light border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Quick Trip CTA if mentioned */}
                    {msg.suggestedTrip && (
                      <div className="mt-2.5 w-full max-w-[85%]">
                        <button
                          type="button"
                          onClick={() => handleCreateTripFromPrompt(msg.suggestedTrip!.destination)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium transition-all shadow-2xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-[#C59B27]" />
                            <span>
                              Generate complete itinerary for <strong>{msg.suggestedTrip.destination}</strong>
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>TravelWise Assistant is curating suggestions...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask for travel ideas, itineraries, budgets, food..."
                  disabled={isSending}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#FAFAF8] border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:bg-white transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="p-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-xs shrink-0"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4 text-[#DFCA9B]" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
