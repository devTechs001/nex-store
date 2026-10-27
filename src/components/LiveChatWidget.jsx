import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Radio } from 'lucide-react';
import { formatRelativeTime } from '../utils/currency.js';

const QUICK_PROMPTS = [
  'What promo codes are active?',
  'Check low stock items',
  'Track order NEX-8942',
  'Tell me about NovaBook Pro 16'
];

export default function LiveChatWidget({ messages, onSendMessage, darkMode, wsConnected }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    onSendMessage(text);
    if (!textOverride) setInput('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div
          className={`flex h-[440px] w-80 sm:w-96 flex-col overflow-hidden rounded-3xl border shadow-2xl ${
            darkMode
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold">NEX Live Store Concierge</div>
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-100">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      wsConnected ? 'bg-emerald-300' : 'bg-amber-300'
                    }`}
                  />
                  <span>Real-Time SQLite + WS Desk</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-white/15 p-1.5 hover:bg-white/25 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {messages.map((msg) => {
              const isCustomer = msg.sender === 'customer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isCustomer
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : darkMode
                        ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <div className="font-mono-num text-[10px] opacity-75 mb-0.5">
                      {msg.sender_name} • {formatRelativeTime(msg.created_at)}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-800/70 px-3 py-2">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp}
                onClick={() => handleSend(qp)}
                className="shrink-0 rounded-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 text-[10px] font-medium text-indigo-300 cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-800 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about promos, stock, or order #..."
              className={`flex-1 rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode
                  ? 'bg-slate-950 border-slate-800 text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 p-2 text-white cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-indigo-600/30 transition cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Live Concierge</span>
          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      )}
    </div>
  );
}
