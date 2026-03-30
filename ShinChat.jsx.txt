import { useState, useRef, useEffect, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg0: "#08080c",
  bg1: "#0f0f15",
  bg2: "#16161e",
  bg3: "#1e1e28",
  bg4: "#252532",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  accent: "#5b6ef5",
  accentDim: "rgba(91,110,245,0.15)",
  accentGlow: "rgba(91,110,245,0.3)",
  textPrimary: "#e8e8f0",
  textSecondary: "#8888a0",
  textMuted: "#55556a",
  online: "#3dd68c",
  delivered: "#5b6ef5",
  read: "#3dd68c",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const ME = { id: "me", displayName: "Shinichiro", username: "shinichiro", avatarUrl: null };

const USERS = [
  { id: "u1", displayName: "Aiko Tanaka", username: "aiko", avatarUrl: null, isOnline: true, lastSeen: null },
  { id: "u2", displayName: "Ren Mori", username: "ren", avatarUrl: null, isOnline: false, lastSeen: "2m ago" },
  { id: "u3", displayName: "Yuki Nakamura", username: "yuki", avatarUrl: null, isOnline: true, lastSeen: null },
  { id: "u4", displayName: "Kaito Sato", username: "kaito", avatarUrl: null, isOnline: false, lastSeen: "1h ago" },
  { id: "u5", displayName: "Hana Fujita", username: "hana", avatarUrl: null, isOnline: true, lastSeen: null },
];

const INIT_CHATS = [
  {
    id: "c1", partnerId: "u1",
    messages: [
      { id: "m1", senderId: "u1", content: "Hey! Did you finish the design review?", ts: "09:14", status: "read" },
      { id: "m2", senderId: "me", content: "Almost — just polishing the typography system. Should be done by noon.", ts: "09:16", status: "read" },
      { id: "m3", senderId: "u1", content: "Perfect. The client meeting is at 2pm so that gives us time.", ts: "09:17", status: "read" },
      { id: "m4", senderId: "me", content: "Sounds good. I'll send the updated file to the shared drive.", ts: "09:19", status: "delivered" },
    ],
    lastTs: "09:19",
  },
  {
    id: "c2", partnerId: "u2",
    messages: [
      { id: "m10", senderId: "u2", content: "Can you review the PR when you get a chance?", ts: "Yesterday", status: "read" },
      { id: "m11", senderId: "me", content: "On it, give me 20 mins", ts: "Yesterday", status: "read" },
      { id: "m12", senderId: "u2", content: "No rush, thanks!", ts: "Yesterday", status: "read" },
    ],
    lastTs: "Yesterday",
  },
  {
    id: "c3", partnerId: "u3",
    messages: [
      { id: "m20", senderId: "u3", content: "The new endpoint is live 🚀", ts: "Mon", status: "read" },
      { id: "m21", senderId: "me", content: "Smooth. Tested on staging, all green.", ts: "Mon", status: "read" },
    ],
    lastTs: "Mon",
  },
  {
    id: "c4", partnerId: "u4",
    messages: [
      { id: "m30", senderId: "u4", content: "Are we still meeting Friday?", ts: "Sun", status: "read" },
    ],
    lastTs: "Sun",
  },
  {
    id: "c5", partnerId: "u5",
    messages: [
      { id: "m40", senderId: "me", content: "Just sent over the brief!", ts: "Sat", status: "read" },
    ],
    lastTs: "Sat",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const hue = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
};

// ─── Components ───────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 40, showOnline = false }) => {
  const h = hue(user.displayName);
  const online = user.isOnline;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, hsl(${h},55%,38%), hsl(${(h+40)%360},65%,50%))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 600, color: "#fff", letterSpacing: "0.02em",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {user.avatarUrl
          ? <img src={user.avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          : initials(user.displayName)
        }
      </div>
      {showOnline && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28,
          borderRadius: "50%", border: `2px solid ${C.bg1}`,
          background: online ? C.online : C.textMuted,
          transition: "background 0.3s",
        }} />
      )}
    </div>
  );
};

const StatusIcon = ({ status }) => {
  if (status === "sending") return <span style={{ color: C.textMuted, fontSize: 11 }}>○</span>;
  if (status === "sent") return <span style={{ color: C.textMuted, fontSize: 11 }}>✓</span>;
  if (status === "delivered") return <span style={{ color: C.delivered, fontSize: 11 }}>✓✓</span>;
  if (status === "read") return <span style={{ color: C.read, fontSize: 11 }}>✓✓</span>;
  return null;
};

const TypingDots = () => (
  <div style={{ display: "flex", gap: 3, alignItems: "center", height: 16, padding: "2px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 6, height: 6, borderRadius: "50%",
        background: C.textSecondary,
        animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ chats, activeId, onSelect, searchQuery, setSearchQuery, view, setView, currentUser }) => {
  const getPartner = (c) => USERS.find(u => u.id === c.partnerId);
  const lastMsg = (c) => c.messages[c.messages.length - 1];

  const filtered = chats.filter(c => {
    const p = getPartner(c);
    return p.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{
      width: 300, height: "100%", display: "flex", flexDirection: "column",
      background: C.bg1, borderRight: `1px solid ${C.border}`,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`,
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.02em", fontFamily: "'DM Sans', sans-serif" }}>
              ShinChat
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["chat", "search", "profile"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
                background: view === v ? C.accentDim : "transparent",
                color: view === v ? C.accent : C.textMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>
                {v === "chat" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
                {v === "search" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
                {v === "profile" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: C.bg2, borderRadius: 10, padding: "8px 12px",
          border: `1px solid ${C.border}`,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            style={{
              background: "none", border: "none", outline: "none", width: "100%",
              fontSize: 13, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map(chat => {
          const partner = getPartner(chat);
          const last = lastMsg(chat);
          const isActive = chat.id === activeId;
          const isFromMe = last.senderId === "me";
          const unread = !isFromMe && last.status !== "read" && !isActive;

          return (
            <button key={chat.id} onClick={() => onSelect(chat.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              borderRadius: 12, border: "none", cursor: "pointer",
              background: isActive ? C.accentDim : "transparent",
              transition: "background 0.15s",
              textAlign: "left", width: "100%",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.bg2; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <Avatar user={partner} size={44} showOnline />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{
                    fontSize: 14, fontWeight: unread ? 700 : 500,
                    color: C.textPrimary, letterSpacing: "-0.01em",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{partner.displayName}</span>
                  <span style={{ fontSize: 11, color: C.textMuted, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{chat.lastTs}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {isFromMe && <StatusIcon status={last.status} />}
                  <span style={{
                    fontSize: 12.5, color: unread ? C.textSecondary : C.textMuted,
                    fontWeight: unread ? 500 : 400,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    flex: 1, fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {last.content}
                  </span>
                  {unread && (
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: C.accent, flexShrink: 0,
                    }} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Profile footer */}
      <div style={{
        padding: "12px 16px", borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Avatar user={ME} size={32} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{ME.displayName}</div>
          <div style={{ fontSize: 11, color: C.online, fontFamily: "'DM Sans', sans-serif" }}>Active now</div>
        </div>
        <button style={{
          width: 28, height: 28, borderRadius: 7, border: "none", background: C.bg3,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: C.textMuted,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Chat Window ──────────────────────────────────────────────────────────────
const ChatWindow = ({ chat, partner, onSend, isTyping }) => {
  const [input, setInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: C.bg0, gap: 12,
    }}>
      <div style={{
        width: 64, height: 64,
        background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`,
        borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 40px ${C.accentGlow}`,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          Select a conversation
        </div>
        <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
          Choose from the list or start a new chat
        </div>
      </div>
    </div>
  );

  const messages = chat.messages;
  let prevDate = null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg0, minWidth: 0 }}>
      {/* Header */}
      <div style={{
        padding: "0 20px", height: 62,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: C.bg1, borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar user={partner} size={38} showOnline />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.01em", fontFamily: "'DM Sans', sans-serif" }}>
              {partner.displayName}
            </div>
            <div style={{ fontSize: 12, color: partner.isOnline ? C.online : C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              {partner.isOnline ? "Active now" : `Last seen ${partner.lastSeen}`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>,
          ].map((icon, i) => (
            <button key={i} style={{
              width: 34, height: 34, borderRadius: 9, border: "none",
              background: "transparent", cursor: "pointer",
              color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bg2; e.currentTarget.style.color = C.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; }}
            >{icon}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px 24px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === "me";
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId;
          const isLast = !nextMsg || nextMsg.senderId !== msg.senderId;

          return (
            <div key={msg.id} style={{
              display: "flex", flexDirection: "column",
              alignItems: isMe ? "flex-end" : "flex-start",
              marginTop: isFirst ? 10 : 2,
            }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: "72%" }}>
                {!isMe && isLast && <Avatar user={partner} size={26} />}
                {!isMe && !isLast && <div style={{ width: 26, flexShrink: 0 }} />}

                <div style={{
                  background: isMe
                    ? `linear-gradient(135deg, ${C.accent}, #7c68f5)`
                    : C.bg3,
                  color: C.textPrimary,
                  padding: "9px 14px",
                  borderRadius: isMe
                    ? `16px 16px ${isLast ? "4px" : "16px"} 16px`
                    : `16px 16px 16px ${isLast ? "4px" : "16px"}`,
                  fontSize: 14, lineHeight: 1.5,
                  boxShadow: isMe ? `0 2px 12px ${C.accentGlow}` : "none",
                  fontFamily: "'DM Sans', sans-serif",
                  wordBreak: "break-word",
                }}>
                  {msg.content}
                </div>
              </div>

              {isLast && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                  marginTop: 4, paddingRight: isMe ? 0 : 34,
                  paddingLeft: isMe ? 0 : 34,
                }}>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{msg.ts}</span>
                  {isMe && <StatusIcon status={msg.status} />}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 10 }}>
            <Avatar user={partner} size={26} />
            <div style={{
              background: C.bg3, padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
            }}>
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 20px 16px",
        background: C.bg1, borderTop: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: C.bg2, borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: "4px 4px 4px 16px",
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.currentTarget.style.borderColor = C.accent}
        onBlur={e => e.currentTarget.style.borderColor = C.border}
        >
          <button style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer",
            color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 14, color: C.textPrimary, padding: "8px 0",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />

          <button style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer",
            color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: 38, height: 38, borderRadius: 11, border: "none",
              background: input.trim()
                ? `linear-gradient(135deg, ${C.accent}, #7c68f5)`
                : C.bg4,
              cursor: input.trim() ? "pointer" : "default",
              color: input.trim() ? "#fff" : C.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
              boxShadow: input.trim() ? `0 2px 12px ${C.accentGlow}` : "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Search View ──────────────────────────────────────────────────────────────
const SearchView = ({ onStartChat }) => {
  const [q, setQ] = useState("");
  const results = q.length > 0
    ? USERS.filter(u => u.displayName.toLowerCase().includes(q.toLowerCase()) || u.username.includes(q.toLowerCase()))
    : USERS;

  return (
    <div style={{ flex: 1, background: C.bg0, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 24, borderBottom: `1px solid ${C.border}`, background: C.bg1 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>
          Find people
        </h2>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: C.bg2, borderRadius: 12, padding: "10px 16px",
          border: `1px solid ${C.border}`,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name or username…"
            style={{
              background: "none", border: "none", outline: "none", flex: 1,
              fontSize: 14, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {results.map(user => (
          <div key={user.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            background: C.bg2, borderRadius: 14, border: `1px solid ${C.border}`,
          }}>
            <Avatar user={user} size={44} showOnline />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{user.displayName}</div>
              <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>@{user.username}</div>
            </div>
            <button onClick={() => onStartChat(user.id)} style={{
              padding: "7px 14px", borderRadius: 9, border: "none",
              background: C.accentDim, color: C.accent,
              fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent; }}
            >Message</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Profile View ─────────────────────────────────────────────────────────────
const ProfileView = () => (
  <div style={{ flex: 1, background: C.bg0, display: "flex", flexDirection: "column", alignItems: "center", padding: 40 }}>
    <div style={{
      width: "100%", maxWidth: 480,
      background: C.bg2, borderRadius: 20, border: `1px solid ${C.border}`,
      overflow: "hidden",
    }}>
      {/* Banner */}
      <div style={{
        height: 100,
        background: `linear-gradient(135deg, ${C.accent}88, #8b5cf688)`,
      }} />
      <div style={{ padding: "0 24px 24px", marginTop: -36 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
          <Avatar user={ME} size={72} />
          <button style={{
            padding: "8px 18px", borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.bg3, color: C.textPrimary, cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          }}>Edit Profile</button>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.02em", fontFamily: "'DM Sans', sans-serif" }}>{ME.displayName}</div>
        <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>@{ME.username}</div>
        <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
          Building ShinChat — a fast, minimal messaging platform. Based in Tokyo.
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
          {[
            { label: "Chats", val: INIT_CHATS.length },
            { label: "Online", val: USERS.filter(u => u.isOnline).length },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1, background: C.bg3, borderRadius: 12, padding: "12px 16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>{stat.val}</div>
              <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Auth Screen ──────────────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  return (
    <div style={{
      width: "100%", height: "100%",
      background: C.bg0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Glow bg */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)`,
        pointerEvents: "none", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
      }} />

      <div style={{
        width: 380, background: C.bg1, borderRadius: 24,
        border: `1px solid ${C.border}`, padding: 36,
        position: "relative", zIndex: 1,
        boxShadow: `0 24px 80px rgba(0,0,0,0.6)`,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 38, height: 38,
            background: `linear-gradient(135deg, ${C.accent}, #8b5cf6)`,
            borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 16px ${C.accentGlow}`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, letterSpacing: "-0.03em" }}>ShinChat</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 24px" }}>
          {mode === "login" ? "Sign in to continue" : "Join ShinChat today"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name"
                style={inputStyle} />
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
                style={inputStyle} />
            </>
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
            type="email" style={inputStyle} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            type="password" style={inputStyle} />
        </div>

        <button onClick={onLogin} style={{
          width: "100%", padding: "13px",
          background: `linear-gradient(135deg, ${C.accent}, #7c68f5)`,
          border: "none", borderRadius: 13, color: "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          marginTop: 20, letterSpacing: "-0.01em",
          boxShadow: `0 4px 20px ${C.accentGlow}`,
          transition: "opacity 0.15s",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.textMuted }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{
            background: "none", border: "none", color: C.accent, cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.08)`,
  borderRadius: 11, color: "#e8e8f0", fontSize: 13.5,
  outline: "none", fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function ShinChat() {
  const [authed, setAuthed] = useState(false);
  const [chats, setChats] = useState(INIT_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("chat");
  const [typingChats, setTypingChats] = useState({});

  const activeChat = chats.find(c => c.id === activeChatId);
  const partner = activeChat ? USERS.find(u => u.id === activeChat.partnerId) : null;

  const selectChat = (id) => {
    setActiveChatId(id);
    setView("chat");
  };

  const sendMessage = (content) => {
    if (!activeChatId) return;
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: "me",
      content,
      ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };

    setChats(prev => prev.map(c =>
      c.id === activeChatId
        ? { ...c, messages: [...c.messages, newMsg], lastTs: newMsg.ts }
        : c
    ));

    // Simulate delivery + typing reply
    setTimeout(() => {
      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: "delivered" } : m) }
          : c
      ));
    }, 800);

    // Simulate partner typing + reply
    setTimeout(() => {
      setTypingChats(prev => ({ ...prev, [activeChatId]: true }));
    }, 1800);

    const replies = [
      "Got it, thanks!",
      "Makes sense 👍",
      "Let me check on that.",
      "Sure, sounds good!",
      "On it.",
      "I'll take a look.",
    ];

    setTimeout(() => {
      setTypingChats(prev => ({ ...prev, [activeChatId]: false }));
      const replyMsg = {
        id: `m_${Date.now()}_r`,
        senderId: activeChat.partnerId,
        content: replies[Math.floor(Math.random() * replies.length)],
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read",
      };
      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, replyMsg], lastTs: replyMsg.ts }
          : c
      ));
      // Mark ours as read
      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: "read" } : m) }
          : c
      ));
    }, 4000);
  };

  const startChatWithUser = (userId) => {
    const existing = chats.find(c => c.partnerId === userId);
    if (existing) { selectChat(existing.id); return; }
    const newChat = {
      id: `c_${Date.now()}`,
      partnerId: userId,
      messages: [],
      lastTs: "",
    };
    setChats(prev => [newChat, ...prev]);
    selectChat(newChat.id);
  };

  if (!authed) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }`}</style>
      <div style={{ width: "100vw", height: "100vh" }}>
        <AuthScreen onLogin={() => setAuthed(true)} />
      </div>
    </>
  );

  const renderMain = () => {
    if (view === "search") return <SearchView onStartChat={startChatWithUser} />;
    if (view === "profile") return <ProfileView />;
    return (
      <ChatWindow
        chat={activeChat}
        partner={partner}
        onSend={sendMessage}
        isTyping={activeChatId ? !!typingChats[activeChatId] : false}
      />
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        input::placeholder { color: #55556a; }
      `}</style>
      <div style={{ width: "100vw", height: "100vh", display: "flex", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar
          chats={chats}
          activeId={activeChatId}
          onSelect={selectChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          view={view}
          setView={setView}
          currentUser={ME}
        />
        {renderMain()}
      </div>
    </>
  );
}
