const mongoose = require('mongoose');

const factCheckLogSchema = new mongoose.Schema(
  {
    _id: { type: String },
    articleId: { type: String, ref: 'Article', required: true, index: true },
    articleTitle: { type: String, default: '' },
    editorId: { type: String, ref: 'User', required: true },
    editorName: { type: String, default: '' },
    claimIndex: { type: Number, required: true },
    originalStatus: { type: String, required: true },
    overriddenStatus: { type: String, required: true },
    reason: { type: String, required: true, minlength: 15 }
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false }, versionKey: false }
);

module.exports = mongoose.models.FactCheckLog || mongoose.model('FactCheckLog', factCheckLogSchema);
