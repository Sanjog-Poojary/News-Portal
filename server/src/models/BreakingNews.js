const mongoose = require('mongoose');

const breakingNewsSchema = new mongoose.Schema(
  {
    _id: { type: String },
    headline: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    urgency: { type: String, default: 'high' },
    sourceUrl: { type: String, default: '' }
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false }, versionKey: false }
);

module.exports = mongoose.models.BreakingNews || mongoose.model('BreakingNews', breakingNewsSchema);
