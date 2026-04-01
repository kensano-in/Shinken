/**
 * ShinChat · Local Database (Firebase Firestore schema, localStorage engine)
 * Schema mirrors: users / chats / messages / games collections
 */

window.DB = (() => {
  // ── helpers ──────────────────────────────────────────────────
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const now = () => new Date().toISOString();
  const read  = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ── collections ───────────────────────────────────────────────
  const col = name => {
    const all = () => read(name) || {};
    const save = data => write(name, data);
    return {
      getAll: all,
      get: id => (all()[id] || null),
      set: (id, doc) => { const d = all(); d[id] = { ...doc, _id: id }; save(d); return d[id]; },
      add: doc => { const id = uid(); const d = all(); d[id] = { ...doc, _id: id }; save(d); return d[id]; },
      del: id => { const d = all(); delete d[id]; save(d); },
      query: fn => Object.values(all()).filter(fn),
    };
  };

  // ── seed demo data ────────────────────────────────────────────
  const seed = () => {
    if (read('_seeded')) return;

    const users = col('users');
    const chats = col('chats');
    const msgs  = col('messages');

    // demo users (passwords stored as plain for demo; spec says bcrypt — noted)
    const shin = users.set('user_shin', { username: 'shin', email: 'shin@shinchat.app', password: '1234', avatar: '#e8403f', createdAt: now(), stats: { messages: 12, aiUses: 3, games: 2 } });
    const kira = users.set('user_kira', { username: 'kira', email: 'kira@shinchat.app', password: '1234', avatar: '#9b59b6', createdAt: now(), stats: { messages: 8, aiUses: 1, games: 1 } });
    const nova = users.set('user_nova', { username: 'nova', email: 'nova@shinchat.app', password: '1234', avatar: '#1abc9c', createdAt: now(), stats: { messages: 5, aiUses: 0, games: 0 } });
    const rex  = users.set('user_rex',  { username: 'rex',  email: 'rex@shinchat.app',  password: '1234', avatar: '#f0a500', createdAt: now(), stats: { messages: 3, aiUses: 2, games: 1 } });

    // DM: shin ↔ kira
    const dm1 = chats.set('chat_dm1', { type: 'dm', members: ['user_shin', 'user_kira'], createdAt: now(), lastMsg: 'yo check this out', lastMsgAt: now() });
    msgs.add({ chatId: 'chat_dm1', senderId: 'user_kira', text: 'hey, you there?', type: 'text', createdAt: new Date(Date.now() - 600000).toISOString() });
    msgs.add({ chatId: 'chat_dm1', senderId: 'user_shin', text: 'yeah what up', type: 'text', createdAt: new Date(Date.now() - 580000).toISOString() });
    msgs.add({ chatId: 'chat_dm1', senderId: 'user_kira', text: 'try the /ai command, it actually works', type: 'text', createdAt: new Date(Date.now() - 560000).toISOString() });
    msgs.add({ chatId: 'chat_dm1', senderId: 'user_shin', text: 'yo check this out', type: 'text', createdAt: new Date(Date.now() - 30000).toISOString() });

    // DM: shin ↔ nova
    const dm2 = chats.set('chat_dm2', { type: 'dm', members: ['user_shin', 'user_nova'], createdAt: now(), lastMsg: 'lets play a game /game ttt', lastMsgAt: now() });
    msgs.add({ chatId: 'chat_dm2', senderId: 'user_nova', text: 'lets play a game /game ttt', type: 'text', createdAt: new Date(Date.now() - 120000).toISOString() });

    // Group: The Squad
    const grp = chats.set('chat_grp1', { type: 'group', name: 'The Squad', members: ['user_shin', 'user_kira', 'user_nova', 'user_rex'], createdAt: now(), lastMsg: 'welcome to the group!', lastMsgAt: now() });
    msgs.add({ chatId: 'chat_grp1', senderId: 'user_shin', text: 'welcome to the group!', type: 'text', createdAt: new Date(Date.now() - 3600000).toISOString() });
    msgs.add({ chatId: 'chat_grp1', senderId: 'user_rex',  text: 'lets goooo 🔥', type: 'text', createdAt: new Date(Date.now() - 3500000).toISOString() });
    msgs.add({ chatId: 'chat_grp1', senderId: 'user_kira', text: '/ai what can you do?', type: 'text', createdAt: new Date(Date.now() - 3400000).toISOString() });
    msgs.add({ chatId: 'chat_grp1', senderId: '__ai__', text: 'I can summarize conversations, answer questions, help you draft replies, and more. Just use /ai followed by your request!', type: 'ai', createdAt: new Date(Date.now() - 3390000).toISOString() });

    write('_seeded', true);
  };

  return {
    // ── Users ──────────────────────────────────────────────────
    users: col('users'),
    getUserByUsername: username => {
      const all = col('users').getAll();
      return Object.values(all).find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    },
    createUser: ({ username, email, password }) => {
      const users = col('users');
      if (Object.values(users.getAll()).find(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username already taken');
      }
      return users.add({ username, email, password, avatar: '#e8403f', createdAt: now(), stats: { messages: 0, aiUses: 0, games: 0 } });
    },
    updateUserStat: (userId, stat) => {
      const users = col('users');
      const user = users.get(userId);
      if (!user) return;
      user.stats = user.stats || {};
      user.stats[stat] = (user.stats[stat] || 0) + 1;
      users.set(userId, user);
    },
    updateUserAvatar: (userId, color) => {
      const users = col('users');
      const user = users.get(userId);
      if (!user) return;
      user.avatar = color;
      users.set(userId, user);
    },

    // ── Chats ──────────────────────────────────────────────────
    chats: col('chats'),
    getChatsForUser: userId => col('chats').query(c => c.members && c.members.includes(userId)),
    getDMBetween: (uid1, uid2) => {
      return col('chats').query(c => c.type === 'dm' && c.members.includes(uid1) && c.members.includes(uid2))[0] || null;
    },
    createDM: (uid1, uid2) => {
      const existing = col('chats').query(c => c.type === 'dm' && c.members.includes(uid1) && c.members.includes(uid2));
      if (existing.length) return existing[0];
      return col('chats').add({ type: 'dm', members: [uid1, uid2], createdAt: now(), lastMsg: '', lastMsgAt: now() });
    },
    createGroup: (name, memberIds) => col('chats').add({ type: 'group', name, members: memberIds, createdAt: now(), lastMsg: '', lastMsgAt: now() }),
    updateChatLastMsg: (chatId, text) => {
      const chats = col('chats');
      const chat = chats.get(chatId);
      if (chat) { chat.lastMsg = text; chat.lastMsgAt = now(); chats.set(chatId, chat); }
    },

    // ── Messages ───────────────────────────────────────────────
    messages: col('messages'),
    getMessages: chatId => col('messages').query(m => m.chatId === chatId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    sendMessage: ({ chatId, senderId, text, type = 'text', gameId = null }) => {
      const data = { chatId, senderId, text, type, createdAt: now() };
      if (gameId) data.gameId = gameId;
      const msg = col('messages').add(data);
      col('chats').getAll(); // touch
      const chats = col('chats');
      const chat = chats.get(chatId);
      if (chat) { chat.lastMsg = text.slice(0, 60); chat.lastMsgAt = now(); chats.set(chatId, chat); }
      return msg;
    },

    // ── Games ──────────────────────────────────────────────────
    games: col('games'),
    createGame: (chatId, player1, player2) => col('games').add({
      chatId, players: [player1, player2],
      board: Array(9).fill(null),
      currentTurn: player1,
      winner: null,
      status: 'playing',
      createdAt: now(),
    }),
    getActiveGame: chatId => col('games').query(g => g.chatId === chatId && g.status === 'playing')[0] || null,
    makeMove: (gameId, cell, userId) => {
      const games = col('games');
      const game = games.get(gameId);
      if (!game || game.status !== 'playing') return null;
      if (game.currentTurn !== userId) return null;
      if (game.board[cell]) return null;

      const symbol = game.players[0] === userId ? 'X' : 'O';
      game.board[cell] = symbol;

      const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const winner = wins.find(([a,b,c]) => game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]);
      if (winner) {
        game.winner = userId;
        game.winningLine = winner;
        game.status = 'finished';
      } else if (!game.board.includes(null)) {
        game.status = 'finished';
        game.winner = 'draw';
      } else {
        game.currentTurn = game.players.find(p => p !== userId);
      }
      games.set(gameId, game);
      return game;
    },

    seed,
  };
})();

