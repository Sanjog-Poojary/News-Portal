const {
  GNEWS_API_KEY,
  GNEWS_COUNTRY,
  GNEWS_LANGUAGE,
  GNEWS_DAILY_REQUEST_LIMIT
} = require('../config');
const { connectDatabase } = require('../db/connection');
const GnewsUsage = require('../models/GnewsUsage');

async function reserveDailyRequest() {
  const usageDate = new Date().toISOString().slice(0, 10);
  await connectDatabase();

  const usage = await GnewsUsage.findOneAndUpdate(
    { _id: usageDate },
    { $inc: { requestCount: 1 } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );

  if (usage.requestCount > GNEWS_DAILY_REQUEST_LIMIT) {
    await GnewsUsage.updateOne({ _id: usageDate }, { $inc: { requestCount: -1 } });
    throw new Error(`GNews daily request limit reached (${GNEWS_DAILY_REQUEST_LIMIT}).`);
  }
}

async function fetchTopHeadlines() {
  if (!GNEWS_API_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    category: 'general',
    country: GNEWS_COUNTRY,
    lang: GNEWS_LANGUAGE,
    max: '10',
    apikey: GNEWS_API_KEY
  });

  await reserveDailyRequest();

  const response = await fetch(
    `https://gnews.io/api/v4/top-headlines?${params.toString()}`,
    { signal: AbortSignal.timeout(10000) }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GNews request failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const payload = await response.json();
  return (payload.articles || [])
    .filter((article) => article.title && article.url)
    .map((article) => ({
      headline: article.title.trim(),
      description: (article.description || '').trim(),
      category: 'General',
      urgency: 'high',
      sourceUrl: article.url
    }));
}

module.exports = {
  fetchTopHeadlines
};
