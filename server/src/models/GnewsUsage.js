const mongoose = require('mongoose');

const gnewsUsageSchema = new mongoose.Schema(
  {
    _id: { type: String },
    requestCount: { type: Number, default: 0 }
  },
  { versionKey: false }
);

module.exports = mongoose.models.GnewsUsage || mongoose.model('GnewsUsage', gnewsUsageSchema);
