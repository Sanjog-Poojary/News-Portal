const {
  GNEWS_API_KEY,
  GNEWS_POLL_INTERVAL_MS
} = require('../config');
const store = require('../data/store');
const { fetchTopHeadlines } = require('../services/gnews.service');

async function syncBreakingNews(io) {
  const headlines = await fetchTopHeadlines();
  let added = 0;

  for (const headline of headlines) {
    const item = store.addExternalBreakingNews(headline);
    if (!item) continue;

    added += 1;
    if (io) {
      io.emit('breaking:news', item);
    }
  }

  return added;
}

function startBreakingNewsPolling(io) {
  if (!GNEWS_API_KEY) {
    console.log('[NEWS.PORTAL] GNews polling disabled: GNEWS_API_KEY is not configured.');
    return null;
  }

  const run = () => {
    syncBreakingNews(io)
      .then((added) => {
        console.log(`[NEWS.PORTAL] GNews sync completed: ${added} new breaking item(s).`);
      })
      .catch((error) => {
        console.error('[NEWS.PORTAL] GNews sync failed:', error.message);
      });
  };

  const timer = setInterval(run, GNEWS_POLL_INTERVAL_MS);
  timer.unref();
  setTimeout(run, 1000);
  return timer;
}

module.exports = {
  startBreakingNewsPolling,
  syncBreakingNews
};
