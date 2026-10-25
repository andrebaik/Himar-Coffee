import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { useChat, SUGGESTIONS } from './useChat.js';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { messages, isLoading, isColdStart, sendMessage, retryLast } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="himar-chat-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-20 md:bottom-6 right-5 z-40 w-14 h-14 rounded-full bg-[#B5532C] hover:bg-[#a04622] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        aria-label={isOpen ? 'Tutup chat asisten' : 'Buka chat asisten'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#6F8F72] rounded-full border-2 border-[#B5532C]" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-5 z-50 md:w-[380px] md:h-[560px] bg-[#FAF4EA] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E7DCCB]">
          {/* Header */}
          <div className="bg-[#2B1B12] text-[#FAF4EA] p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#B5532C] flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm leading-tight text-[#FAF4EA]">
                  Asisten Himar Coffee
                </h3>
                <span className="text-[10px] text-[#FAF4EA]/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6F8F72] inline-block" />
                  Siap menjawab pertanyaanmu
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#FAF4EA]/70 hover:text-[#FAF4EA] rounded-lg transition cursor-pointer"
              aria-label="Tutup panel chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div
            aria-live="polite"
            className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FAF4EA]"
          >
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRetry={retryLast}
                onClosePanel={() => setIsOpen(false)}
              />
            ))}

            {/* Suggestions Chips (shown under welcome message if only 1 message exists) */}
            {messages.length === 1 && !isLoading && (
              <div className="pt-2 pl-9 space-y-1.5">
                <span className="text-[11px] font-semibold text-[#2B1B12]/60 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-[#B5532C]" />
                  Pertanyaan Populer:
                </span>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(sug)}
                      className="text-left text-xs bg-white hover:bg-[#FAF4EA] border border-[#E7DCCB] hover:border-[#B5532C] text-[#2B1B12] px-3 py-2 rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#FAF4EA] border border-[#E7DCCB] text-[#B5532C] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-[#E7DCCB] px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B5532C] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#B5532C] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#B5532C] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {isColdStart && (
                    <p className="text-[11px] text-[#2B1B12]/60 animate-fade-in">
                      Asisten sedang menyiapkan jawaban…
                    </p>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-[#E7DCCB] shrink-0">
            <form onSubmit={handleSend} className="space-y-1.5">
              <div className="flex items-end gap-2 bg-[#FAF4EA] border border-[#E7DCCB] rounded-2xl p-2 focus-within:border-[#B5532C] focus-within:ring-1 focus-within:ring-[#B5532C] transition">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya menu, event, atau pemesanan..."
                  rows={1}
                  className="w-full text-xs bg-transparent focus:outline-none resize-none max-h-24 text-[#2B1B12] placeholder-[#2B1B12]/40"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-[#B5532C] hover:bg-[#a04622] disabled:bg-gray-300 text-white transition cursor-pointer shrink-0"
                  aria-label="Kirim pesan"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex justify-between items-center px-1 text-[10px] text-[#2B1B12]/50">
                <span>Tekan Enter untuk mengirim</span>
                <span>{input.length}/500</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
