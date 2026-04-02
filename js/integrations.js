/**
 * ShinChat Integrations Hub
 * Public APIs inspired by https://github.com/public-apis/public-apis
 */
window.Integrations = (() => {
  const safeJson = async res => {
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
  };

  const withTimeout = (promise, timeout = 7000) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeout)),
    ]);

  const randomInt = max => Math.floor(Math.random() * max);

  const getAdvice = async () => {
    const data = await withTimeout(fetch('https://api.adviceslip.com/advice', { cache: 'no-store' }).then(safeJson));
    return { title: 'Advice', body: data?.slip?.advice || 'No advice available right now.' };
  };

  const getCatFact = async () => {
    const data = await withTimeout(fetch('https://catfact.ninja/fact').then(safeJson));
    return { title: 'Cat Fact', body: data?.fact || 'No fact available right now.' };
  };

  const getQuote = async () => {
    const data = await withTimeout(fetch('https://api.quotable.io/random').then(safeJson));
    return { title: 'Quote', body: `${data?.content || 'No quote available.'} — ${data?.author || 'Unknown'}` };
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
