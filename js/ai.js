/**
 * ShinChat · AI Module
 * Calls OpenAI GPT-4o-mini with chat context
 * Spec: callAI(prompt, chatContext) → aiResponse
 *
 * NOTE: In production, route through a Next.js API route to protect your key.
 * For MVP demo, key is read from localStorage (set via Settings or .env approach).
 */

window.AI = (() => {
  // ── Rate limiting (10 calls/hour per user, per spec) ─────────
  const RATE_LIMIT = 10;
  const WINDOW_MS  = 60 * 60 * 1000; // 1 hour

  const getRateData = userId => {
    try { return JSON.parse(localStorage.getItem(`ai_rate_${userId}`) || '{"calls":[],"blocked":false}'); }
    catch { return { calls: [], blocked: false }; }
  };
  const saveRateData = (userId, data) => localStorage.setItem(`ai_rate_${userId}`, JSON.stringify(data));

  const checkRate = userId => {
    const data = getRateData(userId);
    const cutoff = Date.now() - WINDOW_MS;
    data.calls = data.calls.filter(t => t > cutoff);
    if (data.calls.length >= RATE_LIMIT) {
      saveRateData(userId, data);
      return false; // blocked
    }
    data.calls.push(Date.now());
    saveRateData(userId, data);
    return true; // allowed
  };

  const getRemainingCalls = userId => {
    const data = getRateData(userId);
    const cutoff = Date.now() - WINDOW_MS;
    const recent = data.calls.filter(t => t > cutoff);
    return Math.max(0, RATE_LIMIT - recent.length);
  };

  // ── System prompt (per spec) ──────────────────────────────────
  const SYSTEM_PROMPT = `You are a smart assistant inside a chat app called ShinChat. 
Keep responses short (2-4 sentences), helpful, and conversational. 
Use a slightly casual tone. Don't use excessive markdown — plain text preferred.
If asked to summarize, give a concise 2-3 sentence summary.
If asked to generate a reply, give a short, natural message.`;

  // ── Build context from recent messages ────────────────────────
  const buildContext = (messages, limit = 12) => {
    return messages
      .slice(-limit)
      .filter(m => m.type !== 'game')
      .map(m => ({
        role: m.senderId === '__ai__' ? 'assistant' : 'user',
        content: m.senderId === '__ai__' ? m.text : `[${m.senderName || m.senderId}]: ${m.text}`,
      }));
  };

  // ── Fallback responses (when no API key) ─────────────────────
  const FALLBACK_RESPONSES = {
    'summarize': 'This conversation covers a mix of casual chat and useful exchanges. The main points are friendly greetings, sharing ideas, and some questions about features.',
    'help me reply': 'Sure! How about: "Thanks for sharing that — really appreciate it! Let\'s catch up soon."',
    'what should i ask': 'You could ask about their plans for the week, or bring up something you both find interesting.',
    'make it funny': 'Why did the chat app break up with the email client? Too many unread feelings. 😅',
    'default': 'I\'m here to help! I can summarize your chat, answer questions, or help you draft a reply. What do you need?',
  };

  const getFallback = prompt => {
    const lower = prompt.toLowerCase();
    for (const [key, val] of Object.entries(FALLBACK_RESPONSES)) {
      if (lower.includes(key)) return val;
    }
    return FALLBACK_RESPONSES.default;
  };

  // ── Core API call ─────────────────────────────────────────────
  const call = async ({ prompt, chatContext = [], userId = 'anon', apiKey = null }) => {
    // Rate limit check
    if (!checkRate(userId)) {
      throw new Error(`Rate limit reached. You have 0/${RATE_LIMIT} AI calls remaining this hour.`);
    }

    const key = apiKey || localStorage.getItem('openai_key') || '';

    // No key → smart fallback
    if (!key) {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
      return getFallback(prompt);
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...buildContext(chatContext),
      { role: 'user', content: prompt },
    ];

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 300,
          temperature: 0.75,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || getFallback(prompt);
    } catch (e) {
      if (e.name === 'TimeoutError' || e.name === 'AbortError') {
        return 'AI is taking too long to respond. Please try again.';
      }
      // If invalid key or network error, use fallback
      console.warn('AI API error, using fallback:', e.message);
      return getFallback(prompt);
    }
  };

  return { call, getRemainingCalls, checkRate };
})();


