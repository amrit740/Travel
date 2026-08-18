import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TravelWiseLogo } from '../common/TravelWiseLogo';
import {
  Send,
  X,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Minimize2,
  Maximize2,
  ChevronDown,
} from 'lucide-react';
import { Trip, AIChatMessage } from '../../types';
import { apiAIChat } from '../../services/api';

interface AIChatDrawerProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
}

const QUICK_PROMPTS = [
  '💰 Help reduce my trip budget',
  '🍴 Suggest top dinner for Day 1',
  '🏖️ Add a scenic sunset spot',
  '🎒 What should I pack for this trip?',
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ trip, onTripUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your TravelWise Concierge for ${trip.destination}. Ask me to suggest restaurants, adjust activity schedules, or optimize your budget anytime!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isSending) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await apiAIChat.sendMessage({
        tripId: trip.id,
        userMessage: text,
        history: historyPayload,
      });

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        timestamp: res.timestamp || new Date().toISOString(),
        suggestedActions: res.suggestedActions as any,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `I'm having a little trouble connecting right now, but I can help you modify any activity directly in the timeline!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyAction = async (action: any) => {
    setActionInProgress(action.label);
    try {
      const res = await apiAIChat.applyAction({
        tripId: trip.id,
        actionType: action.type,
        payload: action.payload,
      });

      onTripUpdated(res.trip);

      setMessages((prev) => [
        ...prev,
        {
          id: `applied-${Date.now()}`,
          sender: 'assistant',
          text: `✅ ${res.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      alert(err.message || 'Could not apply action.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] rounded-full px-5 py-3 shadow-xl shadow-[#0B3D2E]/30 flex items-center gap-2.5 group transition-transform active:scale-95 border border-[#C8A96B]/40 no-print"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center p-0.5">
            <TravelWiseLogo variant="emblem" size="xs" theme="dark" className="w-5 h-5" />
          </div>
          <span className="font-medium text-xs tracking-wider uppercase pr-1 hidden sm:inline">TravelWise Concierge</span>
        </button>
      )}

      {/* Slide-Up / Floating Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-[#E3E7E2] flex flex-col overflow-hidden no-print"
          >
            {/* Header */}
            <div className="bg-[#0B3D2E] text-[#F7F5EF] p-4 flex items-center justify-between border-b border-[#C8A96B]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-[#C8A96B]/30 p-1.5">
                  <TravelWiseLogo variant="emblem" size="sm" />
                </div>
                <div>
                  <h4 className="font-serif-title text-base font-medium leading-tight text-[#F7F5EF]">TravelWise Concierge</h4>
                  <p className="text-[11px] text-[#A2B3AA] font-light">Bespoke advisory for {trip.destination}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[#A2B3AA] hover:text-[#F7F5EF] hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Pills */}
            <div className="bg-[#FAF9F5] border-b border-[#E3E7E2] p-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isSending}
                  className="px-2.5 py-1 bg-white hover:bg-[#F7F5EF] text-[#0B3D2E] rounded-full text-xs font-medium border border-[#E3E7E2] whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                        isUser
                          ? 'bg-[#0B3D2E] text-[#F7F5EF] font-normal rounded-br-xs'
                          : 'bg-[#F7F5EF] text-[#18221E] font-light border border-[#E3E7E2] rounded-bl-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Action Buttons suggested by TravelWise */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-2 space-y-1.5 w-full max-w-[85%]">
                        {msg.suggestedActions.map((act: any, idx: number) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => handleApplyAction(act)}
                            disabled={Boolean(actionInProgress)}
                            className="w-full text-left px-3.5 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#F7F5EF] border border-[#C8A96B]/50 text-[#0B3D2E] text-xs font-medium transition-all flex items-center justify-between group active:scale-98 shadow-xs"
                          >
                            <span>{act.label}</span>
                            <TravelWiseLogo variant="emblem" size="xs" className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-[#66736C] text-xs p-2">
                  <div className="w-4 h-4 animate-spin">
                    <TravelWiseLogo variant="emblem" size="xs" />
                  </div>
                  <span>TravelWise Concierge is curating recommendations...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#E3E7E2]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask concierge or refine activities..."
                  className="flex-1 px-4 py-2 rounded-full border border-[#E3E7E2] focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10 text-xs sm:text-sm outline-none font-medium bg-white text-[#18221E]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="p-2.5 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] disabled:opacity-40 text-[#F7F5EF] transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#DFCA9B]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
