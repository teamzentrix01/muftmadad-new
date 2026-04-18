'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-sm shadow-sm w-fit">
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0 shadow">
          MM
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
        }`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {msg.content}
      </div>
    </div>
  );
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [siteData, setSiteData] = useState({ hospitals: [], treatments: [], specialities: [] });
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch site data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospRes, treatRes, specRes] = await Promise.allSettled([
          axios.get(`${API}/hospitals`),
          axios.get(`${API}/admin/getAll`),
          axios.get(`${API}/specialities`),
        ]);
        setSiteData({
          hospitals: hospRes.status === 'fulfilled'
            ? (Array.isArray(hospRes.value.data) ? hospRes.value.data : hospRes.value.data?.data || [])
            : [],
          treatments: treatRes.status === 'fulfilled'
            ? (Array.isArray(treatRes.value.data) ? treatRes.value.data : treatRes.value.data?.data || [])
            : [],
          specialities: specRes.status === 'fulfilled'
            ? (Array.isArray(specRes.value.data) ? specRes.value.data : specRes.value.data?.data || [])
            : [],
        });
        setDataLoaded(true);
      } catch (err) {
        setDataLoaded(true);
      }
    };
    fetchData();
  }, []);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && dataLoaded) {
      setMessages([{
        role: 'assistant',
        content: `🙏 Namaste! I'm your MuftMadad Health Assistant.\n\nI can help you:\n• Understand your symptoms\n• Find the right specialist\n• Discover treatments available\n• Locate nearby hospitals\n\nPlease tell me what health concern you're facing today? You can write in Hindi or English.`,
      }]);
    }
  }, [isOpen, dataLoaded]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Unread count
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') setUnreadCount(c => c + 1);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          hospitals: siteData.hospitals,
          treatments: siteData.treatments,
          specialities: siteData.specialities,
        }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am unable to respond right now. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'Mujhe chest pain ho raha hai',
    'I have knee pain',
    'Aankhon mein dikkat hai',
    'Which hospitals are nearby?',
  ];

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[580px]'
          }`}
          style={{ width: 'min(380px, calc(100vw - 32px))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                MM
              </div>
              <div>
                <p className="text-white font-semibold text-sm">MuftMadad Assistant</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-blue-100 text-xs">Online • Replies instantly</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(m => !m)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <span className="text-lg leading-none">{isMinimized ? '▲' : '▼'}</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {!dataLoaded ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-gray-400 text-xs">Loading assistant...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <MessageBubble key={i} msg={msg} />
                    ))}
                    {loading && (
                      <div className="flex justify-start mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                          MM
                        </div>
                        <TypingIndicator />
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Quick Questions — only show initially */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl flex-shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Apne symptoms batayein..."
                    rows={1}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none bg-gray-50 focus:bg-white transition-colors"
                    style={{ maxHeight: 100 }}
                    disabled={loading || !dataLoaded}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim() || !dataLoaded}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-sm"
                  >
                    <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  Not a substitute for professional medical advice
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </>
  );
}