'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Demo conversation script ──────────────────────────────── */
const DEMO_SCRIPT = [
  { role: 'user',   text: 'Can you summarize the last 20 messages?',           delay: 800  },
  { role: 'typing', text: '',                                                    delay: 1800 },
  { role: 'ai',     text: '📋 Summary: 3 key decisions were made — shipping date confirmed for Q3, design freeze at EOD, and the backend team unblocked.', delay: 2800 },
  { role: 'user',   text: 'Who was blocking the backend?',                       delay: 4200 },
  { role: 'typing', text: '',                                                    delay: 5000 },
  { role: 'ai',     text: '⚡ That was @alex — infrastructure config issue. Resolved 2 hours ago. No action needed.', delay: 6000 },
  { role: 'user',   text: 'Draft a follow-up for the team.',                     delay: 7400 },
  { role: 'typing', text: '',                                                    delay: 8200 },
  { role: 'ai',     text: '✍️ Draft ready: "Hey team — backend is unblocked, design freeze is EOD today, and we\'re locked for Q3 ship. Let\'s go 🚀"', delay: 9200 },
];

const SUGGESTIONS = [
  'Summarize thread',
  'Draft a reply',
  'Find key decisions',
  'Set a reminder',
];

export default function AIDemo() {
  const [messages, setMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const messagesRef = useRef(null);
  const timersRef   = useRef([]);
  const stepRef     = useRef(0);

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const runScript = () => {
    stepRef.current = 0;
    setMessages([]);
    setShowTyping(false);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    DEMO_SCRIPT.forEach((step) => {
      const t = setTimeout(() => {
        if (step.role === 'typing') {
          setShowTyping(true);
        } else {
          setShowTyping(false);
          setMessages(prev => [...prev, step]);
        }
        scrollToBottom();
      }, step.delay);
      timersRef.current.push(t);
    });

    // Loop
    const total = DEMO_SCRIPT[DEMO_SCRIPT.length - 1].delay + 3000;
    const loop = setTimeout(runScript, total);
    timersRef.current.push(loop);
  };

  useEffect(() => {
    runScript();
    return () => timersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, showTyping]);

  const sendMessage = () => {
    const val = inputVal.trim();
    if (!val) return;
    setMessages(prev => [...prev, { role: 'user', text: val }]);
    setInputVal('');
    setTimeout(() => {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        setMessages(prev => [...prev, {
          role: 'ai',
          text: '✨ ShinChat AI understood your request. Full power unlocks at launch.',
        }]);
      }, 1400);
    }, 300);
  };

  const applySuggestion = (s) => {
    setInputVal(s);
  };

  return (
    <section
      id="aidemo"
      aria-labelledby="aidemo-heading"
      style={{ padding: 'var(--s20) 0' }}
    >
      <div className="section">
        <div className="divider" style={{ marginBottom: 'var(--s20)' }} />

        <div className="aidemo-inner">

          {/* Copy */}
          <div className="aidemo-copy">
            <p className="label" style={{ marginBottom: 'var(--s5)' }}>Live Preview</p>
            <h2 id="aidemo-heading" className="h2 aidemo-title">
              AI that actually<br />
              <span className="text-red-gradient">understands</span> you.
            </h2>
            <p className="aidemo-desc">
              ShinChat doesn&apos;t just carry messages — it reads the room.
              Get instant thread summaries, smart drafts, and action extraction
              right inside the conversation.
            </p>
            <div className="aidemo-features">
              {[
                'Thread summarization in one tap',
                'Context-aware reply drafts',
                'Task & decision extraction',
                'Multilingual understanding',
                'NO data leaving your device',
              ].map((f) => (
                <p key={f} className="aidemo-feature-item">{f}</p>
              ))}
            </div>
          </div>

          {/* AI Chat UI */}
          <div
            className="ai-chat-ui"
            role="log"
            aria-label="ShinChat AI demo conversation"
            aria-live="polite"
          >
            <div className="ai-chat-header">
              <div className="ai-chat-avatar" aria-hidden="true">SC</div>
              <div className="ai-chat-info">
                <div className="ai-chat-name">ShinChat AI</div>
                <div className="ai-chat-status">
                  <span className="ai-chat-status-dot" aria-hidden="true" />
                  Active
                </div>
              </div>
              <span className="badge badge-red" style={{ fontSize: '0.55rem' }}>
                Live Demo
              </span>
            </div>

            {/* Messages */}
            <div className="ai-messages" ref={messagesRef}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`ai-msg${msg.role === 'user' ? ' user' : ''}`}
                  aria-label={`${msg.role === 'user' ? 'You' : 'ShinChat AI'}: ${msg.text}`}
                >
                  <div className="ai-msg-avatar" aria-hidden="true">
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className="ai-bubble">{msg.text}</div>
                </div>
              ))}
              {showTyping && (
                <div className="ai-typing-row" aria-label="ShinChat AI is typing">
                  <div className="ai-msg-avatar" aria-hidden="true">AI</div>
                  <div className="ai-typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestion chips */}
            <div className="ai-suggestion-row" role="group" aria-label="AI prompt suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="ai-suggest-chip"
                  onClick={() => applySuggestion(s)}
                  aria-label={`Use suggestion: ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="ai-input-bar" role="form" aria-label="Type a message">
              <input
                className="ai-input-field"
                type="text"
                placeholder="Ask AI something…"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                aria-label="Message input"
              />
              <button
                className="ai-send-btn"
                onClick={sendMessage}
                aria-label="Send message"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2"  x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>

          </div>
        </div>

        <div className="divider" style={{ marginTop: 'var(--s20)' }} />
      </div>
    </section>
  );
}
