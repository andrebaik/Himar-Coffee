import { useState, useEffect, useRef } from 'react';
import client, { normalizeError } from '../../api/client.js';

const SESSION_KEY = 'himar_chat_session_id';

const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'himar_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'bot',
  text: 'Halo! Selamat datang di Himar Coffee Garut ☕ Ada yang bisa kubantu seputar menu, jadwal event, atau cara pemesanan?',
  time: new Date(),
  actions: [],
};

export const SUGGESTIONS = [
  'Menu unggulan apa saja?',
  'Ada event apa minggu ini?',
  'Gimana cara pesan?',
];

export function useChat() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isColdStart, setIsColdStart] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const timerRef = useRef(null);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsgId = 'u_' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLastUserMessage(trimmed);
    setIsLoading(true);
    setIsColdStart(false);

    // After 8s show cold start hint
    timerRef.current = setTimeout(() => {
      setIsColdStart(true);
    }, 8000);

    try {
      const sessionId = getOrCreateSessionId();
      const res = await client.post('/chat', {
        session_id: sessionId,
        message: trimmed,
      });

      const { reply, intent, actions } = res.data.data;

      const botMsg = {
        id: 'b_' + Date.now(),
        sender: 'bot',
        text: reply,
        intent,
        actions: actions || [],
        time: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorObj = normalizeError(err);
      const errorMsg = {
        id: 'err_' + Date.now(),
        sender: 'error',
        text: errorObj.message || 'Gagal menghubungi asisten.',
        retryText: trimmed,
        time: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsLoading(false);
      setIsColdStart(false);
    }
  };

  const retryLast = (text) => {
    sendMessage(text || lastUserMessage);
  };

  return {
    messages,
    isLoading,
    isColdStart,
    sendMessage,
    retryLast,
  };
}
