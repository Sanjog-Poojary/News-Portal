const express = require('express');
const store = require('../data/store');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');
const { sanitizeRequestBody } = require('../middleware/sanitize');

const router = express.Router();

/**
 * GET /api/articles/breaking
 */
router.get('/breaking', (req, res) => {
  const items = store.getBreakingNews();
  res.json(items);
});

/**
 * GET /api/articles/live
 */
router.get('/live', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  res.json(store.getLiveFeedItems(limit));
});

/**
 * GET /api/articles/featured
 */
router.get('/featured', (req, res) => {
  const featured = store.getFeaturedArticles();
  res.json(featured);
});

/**
 * GET /api/articles/author/metrics
 * Returns author metrics for dashboard
 */
router.get('/author/metrics', authenticateToken, requireRole(['author', 'admin']), (req, res) => {
  const metrics = store.getAuthorMetrics(req.user.id);
  res.json(metrics);
});

/**
 * POST /api/articles/scan
 * Asynchronous AI Fact-Check scan endpoint for draft text
 */
router.post('/scan', authenticateToken, requireRole(['author', 'admin']), (req, res) => {
  const { title, body } = req.body;
  if (!body || body.length < 10) {
    return res.status(400).json({ error: 'Article body must contain content to scan.' });
  }

  const result = store.runAiFactCheck(title, body);
  res.json(result);
});

/**
 * GET /api/articles
 */
router.get('/', (req, res) => {
  const { category, search, status, authorId } = req.query;
  const articles = store.getArticles({
    category,
    search,
    status: status === 'all' ? undefined : (status || 'published'),
    authorId
  });
  res.json(articles);
});

/**
 * GET /api/articles/:id
 */
router.get('/:id', optionalAuth, (req, res) => {
  const article = store.getArticleByIdOrSlug(req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }

  store.incrementView(article._id);

  let isBookmarked = false;
  if (req.user) {
    const user = store.getUserById(req.user.id);
    if (user && user.bookmarks) {
      isBookmarked = user.bookmarks.includes(article._id);
    }
  }

  res.json({
    ...article,
    isBookmarked
  });
});

/**
 * POST /api/articles
 * Restricted to Authors and Admins.
 */
router.post(
  '/',
  authenticateToken,
  requireRole(['author', 'admin']),
  sanitizeRequestBody(['body', 'summary']),
  (req, res) => {
    const { title, body, summary, category, tags, coverImage, isFeatured, status, claims, trustScore } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and content body are required.' });
    }

    const authorUser = store.getUserById(req.user.id);
    
    // If claims are not provided, run auto-fact-check simulation
    let processedClaims = claims;
    let processedTrustScore = trustScore;
    if (!processedClaims || processedClaims.length === 0) {
      const scan = store.runAiFactCheck(title, body);
      processedClaims = scan.claims;
      processedTrustScore = scan.trustScore;
    }

    const newArticle = store.createArticle(
      {
        title,
        body,
        summary,
        category,
        tags,
        coverImage,
        isFeatured,
        status: status || 'published',
        claims: processedClaims,
        trustScore: processedTrustScore
      },
      authorUser
    );

    res.status(201).json(newArticle);
  }
);

/**
 * PUT /api/articles/:id
 * Restricted to Authors and Admins.
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole(['author', 'admin']),
  sanitizeRequestBody(['body', 'summary']),
  (req, res) => {
    try {
      const user = store.getUserById(req.user.id);
      const updated = store.updateArticle(req.params.id, req.body, user);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /api/articles/:id/like
 */
router.post('/:id/like', (req, res) => {
  const newCount = store.toggleLike(req.params.id);
  if (newCount === null) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json({ likeCount: newCount });
});

/**
 * POST /api/articles/:id/bookmark
 */
router.post('/:id/bookmark', authenticateToken, (req, res) => {
  const result = store.toggleBookmark(req.user.id, req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'User or article not found' });
  }
  res.json(result);
});

module.exports = router;
