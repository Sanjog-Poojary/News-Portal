const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    _id: { type: String },
    author: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: '' },
      role: { type: String, enum: ['reader', 'author', 'admin'], required: true }
    },
    content: { type: String, required: true },
    parentReplyId: { type: String, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

const forumThreadSchema = new mongoose.Schema(
  {
    _id: { type: String },
    board: { type: String, enum: ['politics', 'technology', 'sports', 'general'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    sourceUrl: { type: String, default: '', index: true },
    author: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: '' },
      role: { type: String, enum: ['reader', 'author', 'admin'], required: true }
    },
    upvotes: { type: [String], default: [] },
    downvotes: { type: [String], default: [] },
    replies: { type: [replySchema], default: [] },
    flagCount: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.models.ForumThread || mongoose.model('ForumThread', forumThreadSchema);
