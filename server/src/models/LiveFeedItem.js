const mongoose = require('mongoose');

const liveFeedItemSchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    url: { type: String, required: true, unique: true },
    imageUrl: { type: String, default: '' },
    sourceName: { type: String, default: 'RSS' },
    category: { type: String, default: 'World' },
    publishedAt: { type: Date },
    fetchedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.models.LiveFeedItem || mongoose.model('LiveFeedItem', liveFeedItemSchema);
