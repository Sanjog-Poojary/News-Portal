const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const store = require('../data/store');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 */
router.post('/login', (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = store.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bookmarks: user.bookmarks || []
    }
  });
});

/**
 * POST /api/auth/register
 */
router.post('/register', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (name.length < 2) {
    return res.status(400).json({ error: 'Name must contain at least 2 characters.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
  }

  if (store.getUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = store.createUser({
    name,
    email,
    password: hashedPassword,
    role: 'reader',
    avatar: ''
  });

  const token = jwt.sign(
    { id: newUser._id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      bookmarks: []
    }
  });
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, (req, res) => {
  const user = store.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bookmarks: user.bookmarks || []
    }
  });
});

module.exports = router;
