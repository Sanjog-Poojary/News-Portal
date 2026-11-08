const express = require('express');
const store = require('../data/store');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

/**
 * GET /api/forum/threads
 * Query: board ('all' | 'technology' | 'politics' | 'sports' | 'general'), sort ('recent' | 'top')
 */
router.get('/threads', (req, res) => {
  const { board = 'all', sort = 'recent' } = req.query;
  const threads = store.getForumThreads({ board, sort });
  res.json(threads);
});

/**
 * GET /api/forum/threads/by-source
 */
router.get('/threads/by-source', (req, res) => {
  const thread = store.getThreadBySourceUrl(req.query.sourceUrl);
  if (!thread) {
    return res.status(404).json({ error: 'No discussion exists for this source.' });
  }
  res.json(thread);
});

/**
 * GET /api/forum/threads/:id
 */
router.get('/threads/:id', (req, res) => {
  const thread = store.getThreadById(req.params.id);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  res.json(thread);
});

/**
 * POST /api/forum/threads
 */
router.post(
  '/threads',
  authenticateToken,
  sanitizeRequestBody(['title', 'content']),
  (req, res) => {
    const { board, title, content, sourceUrl = '' } = req.body;
    if (!title || !content || !board) {
      return res.status(400).json({ error: 'Board, title, and content are required.' });
    }

    const user = store.getUserById(req.user.id);
    const existingThread = store.getThreadBySourceUrl(sourceUrl);
    if (existingThread) {
      return res.json({ existing: true, thread: existingThread });
    }

    const thread = store.createForumThread({ board, title, content, sourceUrl, user });
    res.status(201).json(thread);
  }
);

/**
 * POST /api/forum/threads/:id/reply
 */
router.post(
  '/threads/:id/reply',
  authenticateToken,
  sanitizeRequestBody(['content']),
  (req, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Reply content cannot be empty.' });
    }

    const user = store.getUserById(req.user.id);
    try {
      const thread = store.getThreadById(req.params.id);
      const reply = store.addForumReply(req.params.id, { content: content.trim(), user });
      const io = req.app.get('io');
      if (io && thread?.author?._id && thread.author._id !== req.user.id) {
        io.to(`user:${thread.author._id}`).emit('forum:reply', {
          threadId: thread._id,
          threadTitle: thread.title,
          reply
        });
      }
      res.status(201).json(reply);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
);

/**
 * POST /api/forum/threads/:id/vote
 */
router.post('/threads/:id/vote', authenticateToken, (req, res) => {
  const { direction = 'up' } = req.body;
  try {
    const result = store.voteForumThread(req.params.id, req.user.id, direction);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/forum/threads/:id/flag
 */
router.post('/threads/:id/flag', authenticateToken, (req, res) => {
  const updated = store.flagForumThread(req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Thread not found.' });
  }
  res.json({ message: 'Thread reported for moderation review.', flagCount: updated.flagCount, flagged: updated.flagged });
});

module.exports = router;
