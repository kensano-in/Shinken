/**
 * ShinChat Integrations Hub
 * Public APIs inspired by https://github.com/public-apis/public-apis
 */
window.Integrations = (() => {
  const CACHE_TTL_MS = 45 * 1000;
  const cache = new Map();

  const remember = (key, data) => {
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  };

  const recall = key => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      cache.delete(key);
      return null;
    }
    return item.data;
  };

  const safeJson = async res => {
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
  };

  const requestJson = async (url, { timeout = 7000, cacheMode = 'default' } = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: cacheMode });
      return safeJson(res);
    } finally {
      clearTimeout(timer);
    }
  };

  const randomInt = max => Math.floor(Math.random() * max);

  const getAdvice = async () => {
    const cached = recall('advice');
    if (cached) return cached;
    const data = await requestJson('https://api.adviceslip.com/advice', { cacheMode: 'no-store' });
    return remember('advice', { title: 'Advice', body: data?.slip?.advice || 'No advice available right now.' });
  };

  const getCatFact = async () => {
    const cached = recall('cat');
    if (cached) return cached;
    const data = await requestJson('https://catfact.ninja/fact');
    return remember('cat', { title: 'Cat Fact', body: data?.fact || 'No fact available right now.' });
  };

  const getQuote = async () => {
    const cached = recall('quote');
    if (cached) return cached;
    const data = await requestJson('https://api.quotable.io/random');
    return remember('quote', { title: 'Quote', body: `${data?.content || 'No quote available.'} — ${data?.author || 'Unknown'}` });
  };

  const cards = [getAdvice, getCatFact, getQuote];

  const getDashboardCards = async () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 2);
    const results = await Promise.allSettled(shuffled.map(fn => fn()));

    return results.map((result, idx) => {
      if (result.status === 'fulfilled') return result.value;
      return {
        title: `Feed ${idx + 1}`,
        body: 'Source temporarily unavailable. Try refresh.',
        error: true,
      };
    });
  };

  const getChatCommandResult = async () => {
    const index = randomInt(cards.length);
    return cards[index]();
  };

  return { getDashboardCards, getChatCommandResult };
})();
