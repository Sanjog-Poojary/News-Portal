const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['reader', 'author', 'admin'], default: 'reader', index: true },
    avatar: { type: String, default: '' },
    bookmarks: [{ type: String, ref: 'Article' }]
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
