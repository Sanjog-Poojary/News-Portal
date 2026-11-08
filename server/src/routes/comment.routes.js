const express = require('express');
const store = require('../data/store');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

/**
 * GET /api/comments/:articleId
 */
router.get('/:articleId', (req, res) => {
  const comments = store.getComments(req.params.articleId);
  res.json(comments);
});

/**
 * POST /api/comments/:articleId
 * Guardrails:
 *  - Sanitized text input
 *  - 3-second throttle per user
 *  - Broadcast via Socket.io
 */
router.post(
  '/:articleId',
  authenticateToken,
  sanitizeRequestBody(['content']),
  (req, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const user = store.getUserById(req.user.id);
    try {
      const comment = store.addComment(req.params.articleId, user, content.trim());

      // Broadcast to connected clients in the article room via socket
      const io = req.app.get('io');
      if (io) {
        io.to(`article:${req.params.articleId}`).emit('comment:new', comment);
      }

      res.status(201).json(comment);
    } catch (err) {
      return res.status(429).json({ error: err.message });
    }
  }
);

/**
 * POST /api/comments/:commentId/flag
 * Flags comment. Guardrail: 3 flags auto-hides the comment from public feeds.
 */
router.post('/:commentId/flag', authenticateToken, (req, res) => {
  const updated = store.flagComment(req.params.commentId);
  if (!updated) {
    return res.status(404).json({ error: 'Comment not found.' });
  }

  const io = req.app.get('io');
  if (io && updated.flagged) {
    io.emit('comment:moderated', { commentId: updated._id, flagged: true });
  }

  res.json({ message: 'Comment flagged for moderation.', flagCount: updated.flagCount, flagged: updated.flagged });
});

module.exports = router;
