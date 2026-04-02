/**
 * ShinChat · Main App Controller
 */

// ── Seed demo data ────────────────────────────────────────────
DB.seed();

// ── Session ───────────────────────────────────────────────────
let session = (() => {
  try { return JSON.parse(sessionStorage.getItem('shinchat_session') || 'null'); }
  catch { return null; }
})();

const saveSession = user => {
  session = user;
  sessionStorage.setItem('shinchat_session', JSON.stringify(user));
};

const clearSession = () => {
  session = null;
  sessionStorage.removeItem('shinchat_session');
};

// ── DOM helpers ───────────────────────────────────────────────
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const userPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Toast ─────────────────────────────────────────────────────
const toast = (() => {
  const container = $('toast-container');
  const show = (title, msg = '', type = 'default') => {
    const t = el('div', `toast ${type}`);
    t.innerHTML = `<div><div class="toast-title">${title}</div>${msg ? `<div class="toast-msg">${msg}</div>` : ''}</div>`;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 300); }, 3500);
  };
  return {
    show,
    success: (t, m) => show(t, m, 'success'),
    warn:    (t, m) => show(t, m, 'warn'),
    info:    (t, m) => show(t, m, 'info'),
  };
})();

// ── Custom Cursor ─────────────────────────────────────────────
(() => {
  if (userPrefersReducedMotion) return;
  const dot = $('cursor-dot'), ring = $('cursor-ring');
  let mx = -200, my = -200, rx = -200, ry = -200;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const tick = () => {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  };
  tick();
})();

// ── Particle Canvas ───────────────────────────────────────────
(() => {
  if (userPrefersReducedMotion) return;
  const canvas = $('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  class P {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W; this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.2 + 0.2; this.vy = -(Math.random() * 0.25 + 0.06);
      this.vx = (Math.random() - 0.5) * 0.1; this.a = Math.random() * 0.3 + 0.05;
      this.life = 0; this.max = Math.random() * 600 + 300;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life++; if (this.y < -10 || this.life > this.max) this.reset(); }
    draw() {
      const f = Math.min(1, this.life / 80) * Math.min(1, (this.max - this.life) / 80);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,90,80,${this.a * f})`; ctx.fill();
    }
  }
  for (let i = 0; i < 80; i++) particles.push(new P());
  const draw = () => { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(draw); };
  draw();
})();

// ── Screen Router ─────────────────────────────────────────────
const Router = (() => {
  const screens = document.querySelectorAll('.screen');
  const go = id => {
    screens.forEach(s => { s.classList.remove('active', 'visible'); });
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('active');
    // Double rAF ensures transition fires after display:flex applies
    requestAnimationFrame(() => requestAnimationFrame(() => target.classList.add('visible')));
  };
  return { go };
})();

// ── Avatar helpers ────────────────────────────────────────────
const AVATAR_COLORS = ['#e8403f','#9b59b6','#1abc9c','#f0a500','#3498db','#e67e22','#e91e8c','#00bcd4'];

const makeAvatar = (user, size = 'sm') => {
  const div = el('div', `avatar-${size}`);
  div.style.background = user.avatar || '#e8403f';
  div.textContent = (user.username || '?')[0].toUpperCase();
  return div;
};

const formatTime = iso => {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ── Current chat state ────────────────────────────────────────
let currentChatId = null;
let currentGame   = null;
let typingTimer   = null;
const MAX_NOTIFICATIONS = 20;

// ══════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════
const Auth = (() => {
  const tabLogin  = $('tab-login');
  const tabSignup = $('tab-signup');
  const formLogin  = $('form-login');
  const formSignup = $('form-signup');

  // Tab switching
  const switchTab = tab => {
    tabLogin.classList.toggle('active', tab === 'login');
    tabSignup.classList.toggle('active', tab === 'signup');
    formLogin.classList.toggle('active', tab === 'login');
    formSignup.classList.toggle('active', tab === 'signup');
  };
  tabLogin.addEventListener('click',  () => switchTab('login'));
  tabSignup.addEventListener('click', () => switchTab('signup'));

  // Toggle password visibility
  ['login', 'signup'].forEach(prefix => {
    const toggle = $(`${prefix}-pw-toggle`);
    const field  = $(`${prefix}-password`);
    if (toggle && field) {
      toggle.addEventListener('click', () => {
        field.type = field.type === 'password' ? 'text' : 'password';
      });
    }
  });

  // Login
  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const username = $('login-username').value.trim();
    const password = $('login-password').value;
    if (!username || !password) return;

    const user = DB.getUserByUsername(username);
    if (!user || user.password !== password) {
      shakeForm(formLogin);
      toast.warn('Login failed', 'Invalid username or password.');
      return;
    }
    saveSession(user);
    App.boot();
  });

  // Sign Up
  formSignup.addEventListener('submit', e => {
    e.preventDefault();
    const username = $('signup-username').value.trim();
    const email    = $('signup-email').value.trim();
    const password = $('signup-password').value;

    if (!username || !email || !password) { toast.warn('Missing fields', 'Please fill in all fields.'); return; }
    if (!/^[a-z0-9_]{2,20}$/i.test(username)) { toast.warn('Invalid username', 'Letters, numbers, and _ only.'); return; }
    if (password.length < 4) { toast.warn('Weak password', 'Minimum 4 characters.'); return; }

    try {
      const user = DB.createUser({ username, email, password });
      saveSession(user);
      toast.success('Welcome!', `Account created. Welcome, ${username}!`);
      App.boot();
    } catch (err) {
      toast.warn('Sign Up failed', err.message);
    }
  });

  const shakeForm = form => {
    form.style.animation = 'none';
    requestAnimationFrame(() => {
      form.style.animation = 'shake 0.35s ease';
    });
  };

  return { switchTab };
})();

// ══════════════════════════════════════════════════════════════
//  CHAT LIST
// ══════════════════════════════════════════════════════════════
const ChatList = (() => {
  const renderChatItem = (chat, currentUserId) => {
    // resolve display name
    let name, avatar;
    if (chat.type === 'dm') {
      const otherId = chat.members.find(m => m !== currentUserId);
      const other   = DB.users.get(otherId);
      name   = other ? other.username : 'Unknown';
      avatar = other || { username: '?', avatar: '#555' };
    } else {
      name   = chat.name || 'Group';
      avatar = { username: name[0], avatar: '#e8403f' };
    }

    const item = el('div', 'chat-item');
    item.dataset.chatId = chat._id;
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    if (chat._id === currentChatId) item.classList.add('active');

    const avatarEl = makeAvatar(avatar, 'md');
    const body = el('div', 'chat-item-body');

    const top = el('div', 'chat-item-top');
    const nameEl = el('div', 'chat-item-name', name);
    const timeEl = el('div', 'chat-item-time', chat.lastMsgAt ? formatTime(chat.lastMsgAt) : '');
    top.append(nameEl, timeEl);

    const preview = el('div', 'chat-item-preview', chat.lastMsg || 'No messages yet');
    body.append(top, preview);

    item.append(avatarEl, body);

    item.addEventListener('click', () => ChatArea.open(chat._id));
    item.addEventListener('keydown', e => { if (e.key === 'Enter') ChatArea.open(chat._id); });

    return item;
  };

  const render = (listId = 'chat-list') => {
    if (!session) return;
    const list = $(listId);
    if (!list) return;
    list.innerHTML = '';

    const chats = DB.getChatsForUser(session._id)
      .sort((a, b) => new Date(b.lastMsgAt || 0) - new Date(a.lastMsgAt || 0));

    if (!chats.length) {
      list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-lo);font-size:0.75rem;font-family:var(--font-mono)">No chats yet. Start one!</div>`;
      return;
    }

    chats.forEach(chat => list.appendChild(renderChatItem(chat, session._id)));
  };

  return { render, renderChatItem };
})();

// ══════════════════════════════════════════════════════════════
//  CHAT AREA
// ══════════════════════════════════════════════════════════════
const ChatArea = (() => {
  const open = chatId => {
    currentChatId = chatId;
    Router.go('screen-chat');

    const chat = DB.chats.get(chatId);
    if (!chat) return;

    // Resolve header info
    let name, statusText, avatar;
    if (chat.type === 'dm') {
      const otherId = chat.members.find(m => m !== session._id);
      const other   = DB.users.get(otherId);
      name       = other?.username || 'Unknown';
      avatar     = other || { username: '?', avatar: '#555' };
      statusText = 'Online';
    } else {
      name       = chat.name;
      avatar     = { username: name[0], avatar: '#e8403f' };
      statusText = `${chat.members.length} members`;
    }

    // Populate header avatar
    setAvatar($('chat-header-avatar'), avatar);
    $('chat-header-name').textContent   = name;
    $('chat-header-status').textContent = statusText;

    // Render both sidebars
    ChatList.render('chat-list-2');
    highlightActive('chat-list-2');

    // Render messages
    renderMessages();

    // Populate sidebar user info
    setSidebarUser();
  };

  const setAvatar = (container, user) => {
    container.className = 'avatar-md';
    container.style.background = user.avatar || '#e8403f';
    container.textContent = (user.username || '?')[0].toUpperCase();
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.fontFamily = 'var(--font-head)';
    container.style.fontWeight = '700';
    container.style.borderRadius = '50%';
    container.style.width = '40px';
    container.style.height = '40px';
    container.style.fontSize = '0.88rem';
    container.style.flexShrink = '0';
    container.style.border = '1.5px solid var(--border)';
  };

  const highlightActive = listId => {
    document.querySelectorAll(`#${listId} .chat-item`).forEach(item => {
      item.classList.toggle('active', item.dataset.chatId === currentChatId);
    });
  };

  const renderMessages = () => {
    const wrap = $('messages');
    if (!wrap) return;
    wrap.innerHTML = '';

    const messages = DB.getMessages(currentChatId);
    let prevSenderId = null;
    let prevDate = null;

    messages.forEach((msg, i) => {
      // Date separator
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== prevDate) {
        const sep = el('div', 'date-sep');
        sep.innerHTML = `<div class="date-sep-line"></div><div class="date-sep-text">${msgDate === new Date().toDateString() ? 'Today' : msgDate}</div><div class="date-sep-line"></div>`;
        wrap.appendChild(sep);
        prevDate = msgDate;
      }

      // Game card message
      if (msg.type === 'game' && msg.gameId) {
        renderGameCard(wrap, msg);
        prevSenderId = msg.senderId;
        return;
      }

      // AI message
      if (msg.senderId === '__ai__') {
        const row = el('div', 'msg-row msg-ai');
        const col = el('div', 'msg-col');
        const bubble = el('div', 'msg-bubble', escapeHtml(msg.text));
        const meta = el('div', 'msg-meta');
        meta.innerHTML = `<span class="msg-time">${formatTime(msg.createdAt)}</span>`;
        col.append(bubble, meta);
        row.append(col);
        wrap.appendChild(row);
        prevSenderId = '__ai__';
        return;
      }

      // System message (e.g. game result announcements)
      if (msg.senderId === '__system__') {
        const sys = el('div', 'msg-system');
        sys.innerHTML = `<div class="msg-system-text">${escapeHtml(msg.text)}</div>`;
        wrap.appendChild(sys);
        prevSenderId = '__system__';
        return;
      }

      // Regular message
      const isOwn     = msg.senderId === session._id;
      const continued = prevSenderId === msg.senderId;
      const sender    = DB.users.get(msg.senderId);

      // Skip messages from deleted/unknown users gracefully
      if (!sender && !isOwn) {
        prevSenderId = msg.senderId;
        return;
      }

      const row = el('div', `msg-row${isOwn ? ' own' : ''}${continued ? ' continued' : ''}`);

      if (!isOwn) {
        const avatarWrap = el('div', 'msg-avatar');
        if (sender) {
          avatarWrap.className = 'msg-avatar';
          avatarWrap.style.cssText = `background:${sender.avatar||'#e8403f'};display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:700;font-size:0.65rem;width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;`;
          avatarWrap.textContent = sender.username[0].toUpperCase();
        }
        row.appendChild(avatarWrap);
      }

      const msgCol = el('div', 'msg-col');
      if (!continued && !isOwn && sender) {
        msgCol.appendChild(el('div', 'msg-sender', sender.username));
      }

      const bubble = el('div', 'msg-bubble', escapeHtml(msg.text));
      const meta   = el('div', 'msg-meta');
      meta.innerHTML = `<span class="msg-time">${formatTime(msg.createdAt)}</span>${isOwn ? '<span class="msg-seen">✓✓</span>' : ''}`;
      msgCol.append(bubble, meta);
      row.appendChild(msgCol);
      wrap.appendChild(row);

      prevSenderId = msg.senderId;
    });

    // Scroll to bottom
    const messagesWrap = $('messages-wrap');
    if (messagesWrap) messagesWrap.scrollTop = messagesWrap.scrollHeight;

    // Check for active game
    currentGame = DB.getActiveGame(currentChatId);
  };

  const renderGameCard = (container, msg) => {
    const game = DB.games.get(msg.gameId);
    if (!game) return;
    renderTTTCard(container, game, msg.gameId);
  };

  const escapeHtml = str => String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  return { open, renderMessages, setAvatar, highlightActive, escapeHtml };
})();

// ══════════════════════════════════════════════════════════════
//  TIC-TAC-TOE
// ══════════════════════════════════════════════════════════════
const renderTTTCard = (container, game, gameId) => {
  const isPlayer  = game.players.includes(session._id);
  const mySymbol  = game.players[0] === session._id ? 'X' : 'O';
  const isMyTurn  = game.currentTurn === session._id;
  const player1   = DB.users.get(game.players[0]);
  const player2   = DB.users.get(game.players[1]);

  const card = el('div', 'game-card');
  card.id = `game-${gameId}`;

  // Header
  card.innerHTML = `
    <div class="game-card-header">
      <div class="game-card-title">⊞ Tic-Tac-Toe</div>
      <div class="game-card-badge">${game.status === 'playing' ? 'Live' : 'Ended'}</div>
    </div>
  `;

  // Turn info
  if (game.status === 'playing') {
    const turnUser = DB.users.get(game.currentTurn);
    const turnDiv = el('div', 'game-turn');
    turnDiv.innerHTML = isMyTurn ? `Your turn — <span>You are ${mySymbol}</span>` : `Waiting for <span>${turnUser?.username || '...'}</span>`;
    card.appendChild(turnDiv);
  }

  // Board
  const board = el('div', 'ttt-board');
  game.board.forEach((cell, idx) => {
    const cellEl = el('div', `ttt-cell${cell ? ` ${cell} taken` : ''}`);
    cellEl.textContent = cell || '';

    if (game.winningLine && game.winningLine.includes(idx)) {
      cellEl.classList.add('winning');
    }

    if (!cell && game.status === 'playing' && isMyTurn && isPlayer) {
      cellEl.addEventListener('click', () => {
        const updated = DB.makeMove(gameId, idx, session._id);
        if (!updated) return;

        // Update stats if game finished
        if (updated.status === 'finished') {
          DB.updateUserStat(session._id, 'games');
          setupDashboard();
        }

        // Re-render card in place
        const existingCard = document.getElementById(`game-${gameId}`);
        if (existingCard) {
          const placeholder = document.createElement('div');
          existingCard.replaceWith(placeholder);
          renderTTTCard(placeholder.parentElement || $('messages'), updated, gameId);
          // Move the new card to where placeholder was
          const newCard = document.getElementById(`game-${gameId}`);
          if (newCard && placeholder.parentElement) {
            placeholder.parentElement.insertBefore(newCard, placeholder);
            placeholder.remove();
          }
        }

        // Post result message if game ended
        if (updated.status === 'finished') {
          let resultText;
          if (updated.winner === 'draw') {
            resultText = "It's a draw! Great match! 🤝";
          } else if (updated.winner === session._id) {
            resultText = `${session.username} wins the Tic-Tac-Toe game! 🏆`;
          } else {
            const winner = DB.users.get(updated.winner);
            resultText = `${winner?.username || 'Other player'} wins! Better luck next time.`;
          }
          DB.sendMessage({ chatId: currentChatId, senderId: '__system__', text: resultText, type: 'text' });
          ChatList.render('chat-list');
          ChatList.render('chat-list-2');
        }
      });
    }

    board.appendChild(cellEl);
  });
  card.appendChild(board);

  // Result
  if (game.status === 'finished') {
    const result = el('div', 'game-result');
    if (game.winner === 'draw') {
      result.className = 'game-result draw'; result.textContent = "It's a Draw! 🤝";
    } else if (game.winner === session._id) {
      result.className = 'game-result win'; result.textContent = 'You Win! 🏆';
    } else {
      result.className = 'game-result loss'; result.textContent = 'You Lose. gg';
    }
    card.appendChild(result);

    const actions = el('div', 'game-actions');
    const rematch = el('button', 'game-btn primary', 'Rematch');
    rematch.addEventListener('click', () => startGame(currentChatId));
    actions.appendChild(rematch);
    card.appendChild(actions);
  }

  container.appendChild(card);
};

const startGame = chatId => {
  const chat = DB.chats.get(chatId);
  if (!chat) return;
  if (chat.type !== 'dm') { toast.warn('Game unavailable', 'Tic-Tac-Toe is only for 1-on-1 chats.'); return; }

  const otherUserId = chat.members.find(m => m !== session._id);
  const game = DB.createGame(chatId, session._id, otherUserId);

  DB.sendMessage({ chatId, senderId: session._id, text: '/game ttt', type: 'text' });
  DB.sendMessage({ chatId, senderId: '__system__', text: `${session.username} started Tic-Tac-Toe! 🎮`, type: 'game', gameId: game._id });

  DB.updateUserStat(session._id, 'games');
  setupDashboard();
  currentGame = game;
  ChatArea.renderMessages();
  ChatList.render('chat-list');
  ChatList.render('chat-list-2');
};

// ══════════════════════════════════════════════════════════════
//  MESSAGE SEND + AI
// ══════════════════════════════════════════════════════════════
const sendMessage = async () => {
  const input = $('msg-input');
  const text  = input.value.trim();
  if (!text || !currentChatId) return;
  input.value = '';

  const isAI   = text.startsWith('/ai ') || text === '/ai';
  const isGame = text.toLowerCase() === '/game ttt';
  const isApi  = text.toLowerCase().startsWith('/api');

  if (isGame) {
    startGame(currentChatId);
    return;
  }

  if (isApi) {
    handlePublicApiCommand();
    return;
  }

  // Send user message
  DB.sendMessage({ chatId: currentChatId, senderId: session._id, text, type: 'text' });
  DB.updateUserStat(session._id, 'messages');
  setupDashboard();
  ChatArea.renderMessages();
  ChatList.render('chat-list');
  ChatList.render('chat-list-2');

  if (isAI) {
    const prompt = text.slice(4).trim() || 'help';
    handleAIRequest(prompt);
  } else {
    // Simulate other user typing (demo feel)
    simulateResponse();
  }
};

const handleAIRequest = async prompt => {
  // Show thinking indicator
  const messages = $('messages');
  const thinkingRow = el('div', 'msg-row msg-ai msg-ai-thinking');
  thinkingRow.innerHTML = `<div class="msg-col"><div class="msg-bubble"><div class="ai-thinking-anim">◆ AI thinking<div class="dots"><span>.</span><span>.</span><span>.</span></div></div></div></div>`;
  messages.appendChild(thinkingRow);
  $('messages-wrap').scrollTop = $('messages-wrap').scrollHeight;

  try {
    const chatContext = DB.getMessages(currentChatId);
    const response = await AI.call({ prompt, chatContext, userId: session._id });
    thinkingRow.remove();

    DB.sendMessage({ chatId: currentChatId, senderId: '__ai__', text: response, type: 'ai' });
    DB.updateUserStat(session._id, 'aiUses');
    setupDashboard();

    const remaining = AI.getRemainingCalls(session._id);
    ChatArea.renderMessages();
    ChatList.render('chat-list');
    ChatList.render('chat-list-2');

    if (remaining < 3) toast.warn('AI Limit', `${remaining} AI calls remaining this hour.`);
  } catch (err) {
    thinkingRow.remove();
    DB.sendMessage({ chatId: currentChatId, senderId: '__ai__', text: err.message || 'AI is currently unavailable. Try again later.', type: 'ai' });
    ChatArea.renderMessages();
  }
};

const notify = (title, message, type = 'info') => {
  const items = JSON.parse(localStorage.getItem('shinchat_notifications') || '[]');
  const id = (window.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  items.unshift({ id, title, message, type, createdAt: new Date().toISOString() });
  localStorage.setItem('shinchat_notifications', JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
  toast[type]?.(title, message);
  renderNotifications();
};

const renderNotifications = () => {
  const list = $('notification-list');
  if (!list) return;
  const items = JSON.parse(localStorage.getItem('shinchat_notifications') || '[]');
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = '<p class="notification-empty">No notifications yet. Activity will appear here.</p>';
    return;
  }
  items.forEach(item => {
    const row = el('article', `notification-item ${item.type}`);
    row.innerHTML = `<h3>${ChatArea.escapeHtml(item.title)}</h3><p>${ChatArea.escapeHtml(item.message || '')}</p><time>${formatTime(item.createdAt)}</time>`;
    list.appendChild(row);
  });
};

const setupDashboard = async () => {
  if (!session) return;
  const user = DB.users.get(session._id);
  if (!user) return;
  const metricMessages = $('metric-messages');
  const metricAI = $('metric-ai');
  const metricGames = $('metric-games');
  if (metricMessages) metricMessages.textContent = user.stats?.messages || 0;
  if (metricAI) metricAI.textContent = user.stats?.aiUses || 0;
  if (metricGames) metricGames.textContent = user.stats?.games || 0;
  await refreshApiCards();
};

const refreshApiCards = async () => {
  const wrap = $('api-cards');
  if (!wrap || !window.Integrations) return;
  wrap.innerHTML = '<div class="api-card skeleton"></div><div class="api-card skeleton"></div>';
  try {
    const cards = await Integrations.getDashboardCards();
    wrap.innerHTML = '';
    cards.forEach(card => {
      const cardEl = el('article', `api-card ${card.error ? 'error' : ''}`);
      cardEl.innerHTML = `<h3>${ChatArea.escapeHtml(card.title)}</h3><p>${ChatArea.escapeHtml(card.body)}</p>`;
      wrap.appendChild(cardEl);
    });
  } catch (error) {
    wrap.innerHTML = '<article class="api-card error"><h3>Feed Offline</h3><p>Could not load API cards right now.</p></article>';
    notify('Dashboard API error', error?.message || 'Could not load dashboard API cards.', 'warn');
  }
};

const handlePublicApiCommand = async () => {
  try {
    const payload = await Integrations.getChatCommandResult();
    DB.sendMessage({ chatId: currentChatId, senderId: '__ai__', text: `${payload.title}: ${payload.body}`, type: 'ai' });
    ChatArea.renderMessages();
    ChatList.render('chat-list');
    ChatList.render('chat-list-2');
    notify('Live API fetched', `Added ${payload.title.toLowerCase()} in chat.`, 'success');
  } catch (err) {
    notify('API command failed', err.message || 'Public API unavailable right now.', 'warn');
  }
};

const simulateResponse = () => {
  if (!currentChatId) return;
  const chat = DB.chats.get(currentChatId);
  if (!chat || chat.type !== 'dm') return;

  const otherId = chat.members.find(m => m !== session._id);
  const other   = DB.users.get(otherId);
  if (!other) return;

  // Show typing
  $('typing-user').textContent = other.username;
  $('typing-indicator').style.display = 'flex';

  // Random replies
  const replies = [
    'Got it! 👍', 'lol true', 'yooo', "that's fire 🔥",
    'okay okay', 'say less', 'lowkey agree', '😂😂',
    'bro what', 'facts', "I can't rn 💀", 'no way',
  ];

  const delay = 1200 + Math.random() * 1800;
  typingTimer = setTimeout(() => {
    $('typing-indicator').style.display = 'none';
    if (Math.random() > 0.3) {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      DB.sendMessage({ chatId: currentChatId, senderId: otherId, text: reply, type: 'text' });
      ChatArea.renderMessages();
      ChatList.render('chat-list');
      ChatList.render('chat-list-2');
    }
  }, delay);
};

// ══════════════════════════════════════════════════════════════
//  AI SUGGESTION PANEL
// ══════════════════════════════════════════════════════════════
const setupAISuggestions = () => {
  const btnAI    = $('btn-ai-quick');
  const panel    = $('ai-suggestions');
  const msgInput = $('msg-input');
  let panelOpen  = false;

  const togglePanel = show => {
    panelOpen = show !== undefined ? show : !panelOpen;
    panel.style.display = panelOpen ? 'flex' : 'none';
  };

  btnAI.addEventListener('click', () => togglePanel());

  // Auto-show when user types /ai
  msgInput.addEventListener('input', () => {
    if (msgInput.value.startsWith('/ai') && !panelOpen) togglePanel(true);
    if (!msgInput.value.startsWith('/ai') && panelOpen) togglePanel(false);
  });

  document.querySelectorAll('.ai-suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      msgInput.value = btn.dataset.cmd;
      togglePanel(false);
      msgInput.focus();
    });
  });
};

// ══════════════════════════════════════════════════════════════
//  MODALS
// ══════════════════════════════════════════════════════════════
const Modal = {
  open: id => {
    const m = $(id);
    if (m) m.classList.add('open');
  },
  close: id => {
    const m = $(id);
    if (m) m.classList.remove('open');
  },
};

document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
  btn.addEventListener('click', () => Modal.close(btn.dataset.close || btn.closest('.modal-overlay').id));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) Modal.close(overlay.id); });
});

// ── New DM Modal ──────────────────────────────────────────────
const setupNewChatModal = () => {
  const search   = $('user-search-input');
  const list     = $('user-list');

  const renderUsers = (filter = '') => {
    list.innerHTML = '';
    const all = Object.values(DB.users.getAll())
      .filter(u => u._id !== session._id && u.username.toLowerCase().includes(filter.toLowerCase()));

    all.forEach(user => {
      const item = el('div', 'modal-user-item');
      const ava  = makeAvatar(user, 'sm');
      const info = el('div');
      info.innerHTML = `<div class="modal-user-name">${user.username}</div>`;
      item.append(ava, info);
      item.addEventListener('click', () => {
        Modal.close('modal-new-chat');
        const chat = DB.createDM(session._id, user._id);
        ChatArea.open(chat._id);
        ChatList.render('chat-list');
        ChatList.render('chat-list-2');
      });
      list.appendChild(item);
    });

    if (!all.length) list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-lo);font-size:0.75rem">No users found</div>';
  };

  search.addEventListener('input', () => renderUsers(search.value));

  ['btn-new-chat', 'btn-new-chat-2'].forEach(id => {
    const btn = $(id);
    if (btn) btn.addEventListener('click', () => {
      search.value = '';
      renderUsers();
      Modal.open('modal-new-chat');
    });
  });
};

// ── New Group Modal ───────────────────────────────────────────
const setupNewGroupModal = () => {
  const search   = $('group-user-search');
  const list     = $('group-user-list');
  const selected = $('selected-members');
  const nameIn   = $('group-name-input');
  const createBtn = $('btn-create-group');
  let selectedIds = new Set();

  const renderGroupUsers = (filter = '') => {
    list.innerHTML = '';
    const all = Object.values(DB.users.getAll())
      .filter(u => u._id !== session._id && u.username.toLowerCase().includes(filter.toLowerCase()));

    all.forEach(user => {
      const item = el('div', `modal-user-item${selectedIds.has(user._id) ? ' selected' : ''}`);
      const ava  = makeAvatar(user, 'sm');
      const info = el('div');
      info.innerHTML = `<div class="modal-user-name">${user.username}</div>`;
      const check = el('div', 'modal-user-check');
      item.append(ava, info, check);

      item.addEventListener('click', () => {
        if (selectedIds.has(user._id)) {
          selectedIds.delete(user._id);
          item.classList.remove('selected');
        } else if (selectedIds.size < 9) {
          selectedIds.add(user._id);
          item.classList.add('selected');
        } else {
          toast.warn('Limit reached', 'Max 10 members in a group.');
          return;
        }
        renderSelectedTags();
      });
      list.appendChild(item);
    });
  };

  const renderSelectedTags = () => {
    selected.innerHTML = '';
    selectedIds.forEach(uid => {
      const user = DB.users.get(uid);
      if (!user) return;
      const tag = el('div', 'member-tag');
      tag.innerHTML = `${user.username}<button class="member-tag-remove" data-uid="${uid}">×</button>`;
      tag.querySelector('.member-tag-remove').addEventListener('click', () => {
        selectedIds.delete(uid);
        renderSelectedTags();
        renderGroupUsers(search.value);
      });
      selected.appendChild(tag);
    });
  };

  search.addEventListener('input', () => renderGroupUsers(search.value));

  ['btn-new-group', 'btn-new-group-2'].forEach(id => {
    const btn = $(id);
    if (btn) btn.addEventListener('click', () => {
      selectedIds.clear();
      nameIn.value = '';
      search.value = '';
      selected.innerHTML = '';
      renderGroupUsers();
      Modal.open('modal-new-group');
    });
  });

  createBtn.addEventListener('click', () => {
    const name = nameIn.value.trim();
    if (!name) { toast.warn('Missing name', 'Please enter a group name.'); return; }
    if (selectedIds.size < 1) { toast.warn('Add members', 'Select at least 1 other member.'); return; }

    const memberIds = [session._id, ...selectedIds];
    const chat = DB.createGroup(name, memberIds);
    DB.sendMessage({ chatId: chat._id, senderId: '__system__', text: `${session.username} created the group "${name}"`, type: 'text' });
    Modal.close('modal-new-group');
    toast.success('Group created!', `"${name}" is ready.`);
    ChatArea.open(chat._id);
    ChatList.render('chat-list');
    ChatList.render('chat-list-2');
  });
};

// ══════════════════════════════════════════════════════════════
//  PROFILE
// ══════════════════════════════════════════════════════════════
const Profile = {
  open: () => {
    if (!session) return;
    const user = DB.users.get(session._id) || session;

    const ava = $('profile-avatar');
    ava.style.background = user.avatar || '#e8403f';
    ava.textContent = user.username[0].toUpperCase();
    Object.assign(ava.style, { display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--font-head)', fontWeight:'700', fontSize:'2rem', width:'80px', height:'80px',
      borderRadius:'50%', border:'2px solid var(--border)', flexShrink:'0' });

    $('profile-username').textContent = user.username;
    $('profile-tag').textContent = `#shinchat · member`;
    $('pf-username').textContent = user.username;
    $('pf-email').textContent = user.email || '—';
    $('pf-joined').textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';

    const stats = user.stats || {};
    $('stat-messages').textContent = stats.messages || 0;
    $('stat-ai-uses').textContent  = stats.aiUses || 0;
    $('stat-games').textContent    = stats.games || 0;

    // Color pickers
    const colorWrap = $('avatar-colors');
    colorWrap.innerHTML = '';
    AVATAR_COLORS.forEach(color => {
      const btn = el('button', `avatar-color-btn${user.avatar === color ? ' active' : ''}`);
      btn.style.background = color;
      btn.title = color;
      btn.addEventListener('click', () => {
        DB.updateUserAvatar(session._id, color);
        session.avatar = color;
        saveSession(session);
        ava.style.background = color;
        colorWrap.querySelectorAll('.avatar-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setSidebarUser();
      });
      colorWrap.appendChild(btn);
    });

    Router.go('screen-profile');
  },
};

// ══════════════════════════════════════════════════════════════
//  SIDEBAR USER INFO
// ══════════════════════════════════════════════════════════════
const setSidebarUser = () => {
  if (!session) return;
  const user = DB.users.get(session._id) || session;

  ['sidebar-avatar', 'sidebar-avatar-2'].forEach(id => {
    const ava = $(id);
    if (!ava) return;
    ava.style.cssText = `background:${user.avatar || '#e8403f'};display:flex;align-items:center;justify-content:center;
      font-family:var(--font-head);font-weight:700;font-size:0.75rem;width:32px;height:32px;
      border-radius:50%;border:1.5px solid var(--border);flex-shrink:0;`;
    ava.textContent = user.username[0].toUpperCase();
  });
  ['sidebar-username', 'sidebar-username-2'].forEach(id => {
    const el = $(id); if (el) el.textContent = user.username;
  });

  // Online count (simulate)
  const online = Object.keys(DB.users.getAll()).length;
  ['online-count', 'online-count-2'].forEach(id => {
    const el = $(id); if (el) el.textContent = `${online} online`;
  });
};

// ══════════════════════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════════════════════
const setupSearch = () => {
  ['chat-search', 'chat-search-2'].forEach(id => {
    const input = $(id);
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      const listId = id === 'chat-search' ? 'chat-list' : 'chat-list-2';
      document.querySelectorAll(`#${listId} .chat-item`).forEach(item => {
        const name = item.querySelector('.chat-item-name')?.textContent?.toLowerCase() || '';
        item.style.display = name.includes(q) ? '' : 'none';
      });
    });
  });
};

// ══════════════════════════════════════════════════════════════
//  WIRING
// ══════════════════════════════════════════════════════════════
const wireInputs = () => {
  const sendBtn  = $('btn-send');
  const msgInput = $('msg-input');

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // AI trigger detect
  msgInput.addEventListener('input', () => {
    const panel = $('ai-suggestions');
    if (msgInput.value.startsWith('/ai') && panel) {
      panel.style.display = 'flex';
    } else if (panel) {
      panel.style.display = 'none';
    }
  });

  // Game quick btn
  $('btn-game-quick').addEventListener('click', () => {
    if (!currentChatId) { toast.warn('Open a chat', 'Select a 1-on-1 chat first.'); return; }
    startGame(currentChatId);
  });

  // Back btn (mobile)
  $('btn-chat-back').addEventListener('click', () => Router.go('screen-chat-list'));

  // Logout
  ['btn-logout', 'btn-logout-2'].forEach(id => {
    const btn = $(id);
    if (btn) btn.addEventListener('click', () => {
      clearSession();
      currentChatId = null;
      Router.go('screen-auth');
      toast.info('Logged out', 'See you next time!');
    });
  });

  // Profile
  ['btn-my-profile', 'btn-my-profile-2'].forEach(id => {
    const btn = $(id);
    if (btn) btn.addEventListener('click', () => Profile.open());
  });
  $('btn-profile-back').addEventListener('click', () => {
    Router.go(currentChatId ? 'screen-chat' : 'screen-chat-list');
  });

  $('btn-refresh-api')?.addEventListener('click', refreshApiCards);
  $('btn-notifications')?.addEventListener('click', () => $('notification-drawer')?.classList.add('open'));
  $('btn-close-notifications')?.addEventListener('click', () => $('notification-drawer')?.classList.remove('open'));
};

// ══════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════
const App = {
  boot: () => {
    if (!session) {
      Router.go('screen-auth');
      return;
    }

    // Refresh session from DB
    const freshUser = DB.users.get(session._id);
    if (freshUser) saveSession(freshUser);

    setSidebarUser();
    ChatList.render('chat-list');
    setupDashboard();
    renderNotifications();
    Router.go('screen-chat-list');
    notify('Welcome back!', `Logged in as ${session.username}`, 'success');
  },
};

// ── Init ──────────────────────────────────────────────────────
wireInputs();
setupAISuggestions();
setupNewChatModal();
setupNewGroupModal();
setupSearch();

// Add shake keyframe dynamically
const style = document.createElement('style');
style.textContent = `@keyframes shake {
  0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
}`;
document.head.appendChild(style);

// Route to correct screen
if (session) {
  App.boot();
} else {
  Router.go('screen-auth');
}
