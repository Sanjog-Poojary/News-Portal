const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    articleId: { type: String, ref: 'Article', required: true, index: true },
    author: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: '' }
    },
    content: { type: String, required: true },
    flagCount: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
