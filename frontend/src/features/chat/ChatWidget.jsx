import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useChat, SUGGESTIONS } from './useChat.js';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { messages, isLoading, isColdStart, sendMessage, retryLast } = useChat();

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    closeButtonRef.current?.focus();
    document.body.classList.add('overlay-open');
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('overlay-open');
    };
  }, [isOpen]);

  const handleSend = (event) => {
    event?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        id="himar-chat-toggle"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-14 min-w-14 items-center justify-center border border-[#fffdf8] bg-[#281a13] text-[#fffdf8] shadow-[0_12px_30px_rgba(40,26,19,0.2)] transition hover:bg-[#b5532c] md:bottom-7 md:right-7"
        aria-label={isOpen ? 'Tutup tanya barista' : 'Buka tanya barista'}
        aria-expanded={isOpen}
        aria-controls="barista-panel"
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageSquare className="h-6 w-6" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div id="barista-panel" className="fixed inset-0 z-50 flex items-end justify-end bg-[#281a13]/65 md:inset-auto md:bottom-24 md:right-7 md:bg-transparent">
          <section className="flex h-[100dvh] w-full flex-col border border-[#ded2c1] bg-[#f7f2e9] md:h-[min(42rem,calc(100dvh-8rem))] md:w-[25rem] md:shadow-[0_24px_70px_rgba(40,26,19,0.22)]" role="dialog" aria-modal="true" aria-labelledby="barista-title">
            <header className="flex items-start justify-between bg-[#281a13] px-5 py-5 text-[#fffdf8]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b9c9af]">Bantuan di kedai</p>
                <h2 id="barista-title" className="mt-2 text-3xl leading-none">Tanya barista</h2>
                <p className="mt-3 text-xs leading-5 text-[#fffdf8]/65">Tanya menu, event, atau cara pesan.</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={() => setIsOpen(false)} className="inline-flex min-h-11 min-w-11 items-center justify-center border border-[#fffdf8]/25 text-[#fffdf8] transition hover:bg-[#fffdf8] hover:text-[#281a13]" aria-label="Tutup panel tanya barista">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div aria-live="polite" className="flex-1 overflow-y-auto px-4 py-5 md:px-5">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onRetry={retryLast} onClosePanel={() => setIsOpen(false)} />
              ))}

              {messages.length === 1 && !isLoading && (
                <div className="mt-5 border-t border-[#ded2c1] pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b625b]">Bisa mulai dari sini</p>
                  <div className="mt-3 grid gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="min-h-11 border border-[#ded2c1] bg-[#fffdf8] px-3 text-left text-xs leading-5 text-[#281a13] transition hover:border-[#b5532c] hover:text-[#b5532c]">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="mt-4 border-l-2 border-[#4f6d52] bg-[#fffdf8] px-4 py-3 text-sm text-[#6b625b]">
                  <span className="inline-flex items-center gap-1" aria-label="Barista sedang menyiapkan jawaban">
                    <span className="h-1.5 w-1.5 bg-[#b5532c]" />
                    <span className="h-1.5 w-1.5 bg-[#b5532c]" />
                    <span className="h-1.5 w-1.5 bg-[#b5532c]" />
                  </span>
                  {isColdStart && <span className="ml-3">Asisten sedang menyiapkan jawaban.</span>}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <footer className="border-t border-[#ded2c1] bg-[#fffdf8] p-4">
              <form onSubmit={handleSend}>
                <label htmlFor="barista-message" className="sr-only">Pesan untuk barista</label>
                <div className="flex items-end gap-2 border border-[#281a13] bg-[#f7f2e9] p-2 focus-within:border-[#b5532c]">
                  <textarea
                    id="barista-message"
                    value={input}
                    onChange={(event) => setInput(event.target.value.slice(0, 500))}
                    onKeyDown={handleKeyDown}
                    placeholder="Tulis pertanyaanmu"
                    rows={1}
                    className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-[#281a13] placeholder:text-[#6b625b]/70 focus:outline-none"
                  />
                  <button type="submit" disabled={!input.trim() || isLoading} className="inline-flex min-h-11 min-w-11 items-center justify-center bg-[#b5532c] text-white transition hover:bg-[#8c3f25] disabled:cursor-not-allowed disabled:bg-[#6b625b]" aria-label="Kirim pesan">
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 flex justify-between px-1 text-[0.65rem] text-[#6b625b]">
                  <span>Enter untuk kirim, Shift + Enter untuk baris baru</span>
                  <span>{input.length}/500</span>
                </div>
              </form>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
