const { RSS_FEED_URLS, RSS_POLL_INTERVAL_MS } = require('../config');
const store = require('../data/store');
const { fetchLiveFeedItems } = require('../services/rss.service');

async function syncLiveFeed(io) {
  const items = await fetchLiveFeedItems();
  let saved = 0;

  for (const item of items) {
    const storedItem = store.upsertLiveFeedItem(item);
    if (!storedItem) continue;

    saved += 1;
    if (io) {
      io.emit('live:feed', storedItem);
    }
  }

  return saved;
}

function startRssFeedPolling(io) {
  if (!RSS_FEED_URLS.length) {
    console.log('[NEWS.PORTAL] RSS polling disabled because no feed URLs are configured.');
    return null;
  }

  const run = () => {
    syncLiveFeed(io)
      .then((saved) => {
        console.log(`[NEWS.PORTAL] RSS sync completed: ${saved} live item(s) stored.`);
      })
      .catch((error) => {
        console.error('[NEWS.PORTAL] RSS sync failed:', error.message);
      });
  };

  const timer = setInterval(run, RSS_POLL_INTERVAL_MS);
  timer.unref();
  setTimeout(run, 1000);
  return timer;
}

module.exports = {
  startRssFeedPolling,
  syncLiveFeed
};
