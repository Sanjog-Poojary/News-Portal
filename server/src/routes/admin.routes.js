const express = require('express');
const store = require('../data/store');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/users
 * User RBAC table
 */
router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
  const users = store.getAllUsers();
  res.json(users);
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role (Reader / Author / Admin)
 */
router.put('/users/:id/role', authenticateToken, requireRole('admin'), (req, res) => {
  const { role } = req.body;
  try {
    const updated = store.updateUserRole(req.params.id, role);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/admin/moderation
 * Moderation queue
 */
router.get('/moderation', authenticateToken, requireRole('admin'), (req, res) => {
  const items = store.getFlaggedItems();
  res.json(items);
});

/**
 * POST /api/admin/moderation/:id/resolve
 * Action: 'approve' (clears flags) | 'remove' (deletes comment/thread)
 */
router.post('/moderation/:id/resolve', authenticateToken, requireRole('admin'), (req, res) => {
  const { type, action } = req.body;
  try {
    const result = store.resolveFlaggedItem(type, req.params.id, action);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/admin/breaking
 * Dispatches breaking news item to all connected sockets.
 */
router.post('/breaking', authenticateToken, requireRole('admin'), (req, res) => {
  const { headline, category, urgency } = req.body;
  if (!headline || !headline.trim()) {
    return res.status(400).json({ error: 'Headline is required.' });
  }

  try {
    const item = store.addBreakingNews(headline.trim(), category || 'General', urgency || 'high');

    const io = req.app.get('io');
    if (io) {
      io.emit('breaking:news', item);
    }

    res.status(201).json({ message: 'Breaking alert broadcasted successfully.', item });
  } catch (err) {
    return res.status(429).json({ error: err.message });
  }
});

/**
 * GET /api/admin/audit-logs
 * AI Fact-Check Override Audit Log
 */
router.get('/audit-logs', authenticateToken, requireRole('admin'), (req, res) => {
  const logs = store.getFactCheckLogs();
  res.json(logs);
});

/**
 * POST /api/admin/override-claim
 * Guardrail: Minimum 15-character rationale mandatory for HITL override.
 */
router.post('/override-claim', authenticateToken, requireRole(['author', 'admin']), (req, res) => {
  const { articleId, claimIndex, overriddenStatus, reason } = req.body;

  if (!articleId || claimIndex === undefined || !overriddenStatus) {
    return res.status(400).json({ error: 'Missing required override parameters.' });
  }

  const article = store.getArticleByIdOrSlug(articleId);
  if (!article || !article.claims[claimIndex]) {
    return res.status(404).json({ error: 'Article or target claim not found.' });
  }

  try {
    const originalStatus = article.claims[claimIndex].status;
    article.claims[claimIndex].status = overriddenStatus;

    const logEntry = store.logFactCheckOverride({
      articleId: article._id,
      editorId: req.user.id,
      claimIndex,
      originalStatus,
      overriddenStatus,
      reason
    });

    res.json({ message: 'Claim overridden and audit logged.', log: logEntry, updatedClaim: article.claims[claimIndex] });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
