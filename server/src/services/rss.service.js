const Parser = require('rss-parser');
const { RSS_FEED_URLS } = require('../config');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'NEWS.PORTAL/1.0 RSS reader'
  }
});

function stripMarkup(value = '') {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSourceName(feed, feedUrl) {
  if (feed.title) return feed.title.trim();
  try {
    return new URL(feedUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'RSS';
  }
}

async function fetchLiveFeedItems() {
  const feedUrls = RSS_FEED_URLS.filter(Boolean);
  const results = await Promise.allSettled(
    feedUrls.map(async (feedUrl) => {
      const feed = await parser.parseURL(feedUrl);
      const sourceName = getSourceName(feed, feedUrl);

      return (feed.items || [])
        .filter((item) => item.title && item.link)
        .map((item) => ({
          title: item.title.trim(),
          description: stripMarkup(item.contentSnippet || item.content || item.summary || ''),
          url: item.link.trim(),
          imageUrl: item.enclosure?.url || item.image?.url || '',
          sourceName,
          category: 'Live Feed',
          publishedAt: item.isoDate || item.pubDate || null,
          fetchedAt: new Date()
        }));
    })
  );

  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value);
}

module.exports = {
  fetchLiveFeedItems
};
