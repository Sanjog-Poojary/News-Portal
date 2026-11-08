const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/news_portal';
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '';
const GNEWS_COUNTRY = process.env.GNEWS_COUNTRY || 'us';
const GNEWS_LANGUAGE = process.env.GNEWS_LANGUAGE || 'en';
const GNEWS_POLL_INTERVAL_MS = Number(process.env.GNEWS_POLL_INTERVAL_MS || 900000);
const GNEWS_DAILY_REQUEST_LIMIT = Number(process.env.GNEWS_DAILY_REQUEST_LIMIT || 100);
const RSS_FEED_URLS = (process.env.RSS_FEED_URLS || [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.npr.org/1001/rss.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml'
].join(',')).split(',').map((url) => url.trim()).filter(Boolean);
const RSS_POLL_INTERVAL_MS = Number(process.env.RSS_POLL_INTERVAL_MS || 900000);

module.exports = {
  PORT,
  JWT_SECRET,
  CLIENT_URL,
  MONGO_URI,
  GNEWS_API_KEY,
  GNEWS_COUNTRY,
  GNEWS_LANGUAGE,
  GNEWS_POLL_INTERVAL_MS,
  GNEWS_DAILY_REQUEST_LIMIT,
  RSS_FEED_URLS,
  RSS_POLL_INTERVAL_MS
};
