const mongoose = require('mongoose');

const authorSnapshotSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['reader', 'author', 'admin'], required: true }
  },
  { _id: false }
);

const sourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const claimSchema = new mongoose.Schema(
  {
    claimId: { type: String, required: true },
    claimText: { type: String, required: true },
    status: { type: String, enum: ['Verified', 'Unverified', 'Disputed', 'Needs Context'], required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    sources: { type: [sourceSchema], default: [] }
  },
  { _id: false }
);

const articleSchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, default: '' },
    body: { type: String, required: true },
    author: { type: authorSnapshotSchema, required: true },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'pending_review', 'published'], default: 'draft', index: true },
    isFeatured: { type: Boolean, default: false },
    readTime: { type: String, default: '' },
    trustScore: {
      rollup: { type: String, default: 'Pending AI Verification' },
      confidence: { type: Number, min: 0, max: 100, default: 0 },
      status: { type: String, default: 'pending' }
    },
    claims: { type: [claimSchema], default: [] },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);
