import React, { useState, useRef, useEffect } from 'react';
import { aiChat } from '../utils/api';

const SUGGESTED_QUESTIONS = [
  'What can I grow in a 2L plastic bottle?',
  'My tomato leaves are turning yellow',
  'Best plants for 3 hours of sunlight?',
  'How to make free fertilizer at home?',
  'Which plants grow fastest?',
];

const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', background: '#f3f4f6', borderRadius: '16px 16px 16px 4px', width: 'fit-content', marginBottom: 8 }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', animation: `bounce 1.2s infinite ${i * 0.2}s` }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
  </div>
);

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! 🌿 I'm Kisaan Mitra, your personal farming expert. Ask me anything — which plant suits your container, how to fix yellow leaves, or what soil to use. I'm here to help!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const res = await aiChat({ message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please check your internet and try again! 🌱'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 999,
          width: 60, height: 60, borderRadius: '50%',
          background: open ? '#374151' : 'linear-gradient(135deg, #16a34a, #15803d)',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(22,163,74,.4)',
          transition: 'all .25s'
        }}
        title="Ask Kisaan Mitra AI"
      >
        {open ? '✕' : '🌿'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28, zIndex: 998,
          width: 380, height: 520,
          background: '#fff', borderRadius: 20,
          border: '1px solid #e5e7eb',
          boxShadow: '0 20px 60px rgba(0,0,0,.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', fontFamily: "'Outfit', sans-serif"
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', padding: '16px 20px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌿</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Kisaan Mitra AI</div>
                <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Powered by Claude · Plant Expert
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 6, alignSelf: 'flex-end' }}>🌿</div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#16a34a' : '#f3f4f6',
                  color: msg.role === 'user' ? '#fff' : '#1f2937',
                  fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌿</div>
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only show when chat is short) */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 12px 8px', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6, paddingLeft: 4 }}>Quick questions:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                  <button key={q} onClick={() => sendMessage(q)} style={{
                    padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    border: '1px solid #d1fae5', background: '#f0fdf4', color: '#15803d',
                    cursor: 'pointer', transition: 'all .15s', fontFamily: "'Outfit', sans-serif"
                  }}
                    onMouseOver={e => { e.target.style.background = '#dcfce7'; }}
                    onMouseOut={e => { e.target.style.background = '#f0fdf4'; }}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, flexShrink: 0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about any plant, problem, or tip..."
              rows={1}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 12, resize: 'none',
                border: '1.5px solid #e5e7eb', fontSize: 13,
                fontFamily: "'Outfit', sans-serif", outline: 'none',
                transition: 'border-color .15s', lineHeight: 1.5,
                maxHeight: 80, overflowY: 'auto'
              }}
              onFocus={e => e.target.style.borderColor = '#16a34a'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end',
                background: loading || !input.trim() ? '#e5e7eb' : '#16a34a',
                color: '#fff', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s'
              }}
            >
              {loading ? '⏳' : '↑'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
