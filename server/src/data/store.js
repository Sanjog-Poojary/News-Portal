const {
  seedUsers,
  seedBreakingNews,
  seedArticles,
  seedComments,
  seedForumThreads,
  seedFactCheckLogs
} = require('./seedData');
const { connectDatabase } = require('../db/connection');
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const ForumThread = require('../models/ForumThread');
const BreakingNews = require('../models/BreakingNews');
const FactCheckLog = require('../models/FactCheckLog');
const LiveFeedItem = require('../models/LiveFeedItem');

class DataStore {
  constructor() {
    this.users = [...seedUsers];
    this.articles = [...seedArticles];
    this.breakingNews = [...seedBreakingNews];
    this.liveFeedItems = [];
    this.comments = [...seedComments];
    this.forumThreads = [...seedForumThreads];
    this.factCheckLogs = [...seedFactCheckLogs];
    this.userLastCommentTime = new Map(); // 3-second throttle per user
    this.adminLastBroadcastTime = []; // 5 broadcasts/min rate limit
    this.persistenceQueues = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    await connectDatabase();
    this.users = await this.loadCollection(User, seedUsers);
    this.articles = await this.loadCollection(Article, seedArticles);
    this.comments = await this.loadCollection(Comment, seedComments);
    this.forumThreads = await this.loadCollection(ForumThread, seedForumThreads);
    this.breakingNews = (await this.loadCollection(
      BreakingNews,
      seedBreakingNews.map(({ id, ...item }) => ({ ...item, _id: id }))
    )).map(({ _id, ...item }) => ({ ...item, id: _id }));
    this.liveFeedItems = await this.loadCollection(LiveFeedItem, []);
    this.factCheckLogs = await this.loadCollection(FactCheckLog, seedFactCheckLogs);
    this.initialized = true;
  }

  async loadCollection(Model, seedDocuments) {
    const storedDocuments = await Model.find().lean();
    if (storedDocuments.length > 0) {
      return storedDocuments.map((document) => this.normalizeDocument(document));
    }

    await Model.insertMany(seedDocuments);
    return seedDocuments.map((document) => this.normalizeDocument(document));
  }

  normalizeDocument(document) {
    return JSON.parse(JSON.stringify(document));
  }

  schedulePersistence(collection, operation) {
    const previous = this.persistenceQueues.get(collection) || Promise.resolve();
    const next = previous
      .then(operation)
      .catch((error) => {
        console.error(`[NEWS.PORTAL] MongoDB persistence failed for ${collection}:`, error.message);
      });

    this.persistenceQueues.set(collection, next);
    return next;
  }

  persistDocument(collection, document) {
    const mappings = {
      users: User,
      articles: Article,
      comments: Comment,
      forumThreads: ForumThread,
      breakingNews: BreakingNews,
      factCheckLogs: FactCheckLog,
      liveFeedItems: LiveFeedItem
    };
    const Model = mappings[collection];
    if (!Model) throw new Error(`Unknown persistence collection: ${collection}`);

    const record = { ...document };
    if (collection === 'breakingNews') {
      record._id = record.id;
      delete record.id;
    }

    return this.schedulePersistence(collection, () => (
      Model.replaceOne({ _id: record._id }, record, { upsert: true })
    ));
  }

  deleteDocument(collection, id) {
    const mappings = {
      comments: Comment,
      forumThreads: ForumThread
    };
    const Model = mappings[collection];
    if (!Model) throw new Error(`Unknown delete collection: ${collection}`);

    return this.schedulePersistence(collection, () => Model.deleteOne({ _id: id }));
  }

  // --- USER & RBAC METHODS ---
  getUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    return this.users.find(u => u._id === id);
  }

  getAllUsers() {
    return this.users.map(({ password, ...rest }) => rest);
  }

  updateUserRole(userId, newRole) {
    const validRoles = ['reader', 'author', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found.');
    user.role = newRole;
    this.persistDocument('users', user);
    return { _id: user._id, name: user.name, email: user.email, role: user.role };
  }

  createUser(userData) {
    const user = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      bookmarks: [],
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(user);
    this.persistDocument('users', user);
    return user;
  }

  toggleBookmark(userId, articleId) {
    const user = this.getUserById(userId);
    if (!user) return false;
    if (!user.bookmarks) user.bookmarks = [];

    const idx = user.bookmarks.indexOf(articleId);
    let bookmarked = false;
    if (idx >= 0) {
      user.bookmarks.splice(idx, 1);
    } else {
      user.bookmarks.push(articleId);
      bookmarked = true;
    }
    this.persistDocument('users', user);
    return { bookmarked, bookmarks: user.bookmarks };
  }

  // --- ARTICLE & AUTHOR METRICS METHODS ---
  getArticles({ category, search, status, authorId } = {}) {
    return this.articles.filter(article => {
      if (status && article.status !== status) return false;
      if (authorId && article.author?._id !== authorId) return false;
      if (category && category.toLowerCase() !== 'all') {
        if (article.category.toLowerCase() !== category.toLowerCase()) return false;
      }
      if (search && search.trim()) {
        const query = search.toLowerCase().trim();
        const inTitle = article.title.toLowerCase().includes(query);
        const inSummary = (article.summary || '').toLowerCase().includes(query);
        const inCategory = article.category.toLowerCase().includes(query);
        const inTags = (article.tags || []).some(t => t.toLowerCase().includes(query));
        const inAuthor = (article.author?.name || '').toLowerCase().includes(query);
        if (!inTitle && !inSummary && !inCategory && !inTags && !inAuthor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getFeaturedArticles() {
    return this.articles.filter(a => a.isFeatured && a.status === 'published');
  }

  getArticleByIdOrSlug(idOrSlug) {
    return this.articles.find(a => a._id === idOrSlug || a.slug === idOrSlug);
  }

  getAuthorMetrics(authorId) {
    const authorArticles = this.articles.filter(a => a.author?._id === authorId);
    const published = authorArticles.filter(a => a.status === 'published').length;
    const drafts = authorArticles.filter(a => a.status === 'draft' || a.status === 'pending_review').length;
    const views = authorArticles.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
    return {
      totalPublished: published,
      draftsPending: drafts,
      totalViews: views,
      articleCount: authorArticles.length
    };
  }

  createArticle(articleData, authorUser) {
    const title = articleData.title;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const article = {
      _id: `art_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      slug,
      summary: articleData.summary || title.slice(0, 140),
      body: articleData.body,
      author: {
        _id: authorUser._id,
        name: authorUser.name,
        avatar: authorUser.avatar,
        role: authorUser.role
      },
      category: articleData.category || 'Tech',
      tags: articleData.tags || ['Journalism'],
      coverImage: articleData.coverImage || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      status: articleData.status || 'published',
      isFeatured: Boolean(articleData.isFeatured),
      readTime: `${Math.max(2, Math.round((articleData.body || '').split(' ').length / 160))} min read`,
      trustScore: articleData.trustScore || {
        rollup: 'Mostly Verified',
        confidence: 88,
        status: 'verified'
      },
      claims: articleData.claims || [],
      viewCount: 0,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.articles.unshift(article);
    this.persistDocument('articles', article);
    return article;
  }

  updateArticle(articleId, updateData, user) {
    const article = this.getArticleByIdOrSlug(articleId);
    if (!article) throw new Error('Article not found');
    
    // Check permission: author must match or user must be admin
    if (user.role !== 'admin' && article.author?._id !== user._id) {
      throw new Error('Unauthorized to edit this article.');
    }

    // Guardrail: Invalidate trust score on body modification
    const bodyModified = updateData.body && updateData.body !== article.body;
    if (bodyModified) {
      article.trustScore = {
        rollup: 'Pending AI Verification',
        confidence: 0,
        status: 'pending'
      };
    }

    Object.assign(article, updateData, {
      updatedAt: new Date().toISOString()
    });

    this.persistDocument('articles', article);
    return article;
  }

  // Automated AI Fact Check scan simulation on article content
  runAiFactCheck(title, body) {
    const cleanText = (body || '').replace(/<[^>]*>?/gm, '');
    const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 25);
    
    const sampleClaims = sentences.slice(0, 3).map((sentence, idx) => {
      const isHighConfidence = idx === 0 || sentence.length > 50;
      return {
        claimId: `claim_${Date.now()}_${idx}`,
        claimText: sentence,
        status: isHighConfidence ? 'Verified' : 'Needs Context',
        confidence: isHighConfidence ? Math.floor(85 + Math.random() * 12) : Math.floor(60 + Math.random() * 15),
        sources: [
          { name: 'Global Academic Press Index', url: 'https://scholar.archive.org' },
          { name: 'Verified Journalistic Wire', url: 'https://reuters.com' }
        ]
      };
    });

    if (sampleClaims.length === 0) {
      sampleClaims.push({
        claimId: `claim_${Date.now()}_0`,
        claimText: title || 'Factual assertions validated against primary registries.',
        status: 'Verified',
        confidence: 91,
        sources: [{ name: 'International Press Syndicate', url: 'https://apnews.com' }]
      });
    }

    const avgConfidence = Math.round(
      sampleClaims.reduce((acc, c) => acc + c.confidence, 0) / sampleClaims.length
    );

    const trustScore = {
      rollup: avgConfidence >= 85 ? 'Mostly Verified' : avgConfidence >= 65 ? 'Needs Context' : 'Disputed',
      confidence: avgConfidence,
      status: avgConfidence >= 85 ? 'verified' : avgConfidence >= 65 ? 'needs_context' : 'disputed'
    };

    return { claims: sampleClaims, trustScore };
  }

  toggleLike(articleId) {
    const article = this.getArticleByIdOrSlug(articleId);
    if (!article) return null;
    article.likeCount = (article.likeCount || 0) + 1;
    this.persistDocument('articles', article);
    return article.likeCount;
  }

  incrementView(articleId) {
    const article = this.getArticleByIdOrSlug(articleId);
    if (article) {
      article.viewCount = (article.viewCount || 0) + 1;
      this.persistDocument('articles', article);
    }
  }

  // --- BREAKING NEWS ---
  getBreakingNews() {
    return this.breakingNews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  addBreakingNews(headline, category = 'General', urgency = 'high', sourceUrl = '') {
    const now = Date.now();
    this.adminLastBroadcastTime = this.adminLastBroadcastTime.filter(t => now - t < 60000);
    if (this.adminLastBroadcastTime.length >= 5) {
      throw new Error('Rate limit exceeded: Maximum 5 breaking news dispatches per minute.');
    }
    this.adminLastBroadcastTime.push(now);

    const item = {
      id: `brk_${Date.now()}`,
      headline,
      category,
      urgency,
      sourceUrl,
      timestamp: new Date().toISOString()
    };
    this.breakingNews.unshift(item);
    if (this.breakingNews.length > 20) this.breakingNews.pop();
    this.persistDocument('breakingNews', item);
    return item;
  }

  addExternalBreakingNews({
    headline,
    description = '',
    category = 'General',
    urgency = 'high',
    sourceUrl = ''
  }) {
    const duplicate = this.breakingNews.some((item) => (
      item.headline === headline || (sourceUrl && item.sourceUrl === sourceUrl)
    ));

    if (duplicate) return null;

    const item = {
      id: `brk_ext_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      headline,
      description,
      category,
      urgency,
      sourceUrl,
      timestamp: new Date().toISOString()
    };

    this.breakingNews.unshift(item);
    if (this.breakingNews.length > 20) this.breakingNews.pop();
    this.persistDocument('breakingNews', item);
    return item;
  }

  // --- LIVE RSS FEED ---
  getLiveFeedItems(limit = 30) {
    return this.liveFeedItems
      .sort((a, b) => new Date(b.publishedAt || b.fetchedAt) - new Date(a.publishedAt || a.fetchedAt))
      .slice(0, limit);
  }

  upsertLiveFeedItem(item) {
    const existingIndex = this.liveFeedItems.findIndex((entry) => entry.url === item.url);
    if (existingIndex >= 0) {
      const existingItem = this.liveFeedItems[existingIndex];
      const hasChanges = ['title', 'description', 'imageUrl', 'sourceName', 'category', 'publishedAt']
        .some((field) => existingItem[field] !== item[field]);
      if (!hasChanges) return null;

      const updatedItem = { ...existingItem, ...item };
      this.liveFeedItems[existingIndex] = updatedItem;
      this.persistDocument('liveFeedItems', updatedItem);
      return updatedItem;
    }

    const newItem = {
      _id: `rss_${Buffer.from(item.url).toString('base64url').slice(0, 40)}`,
      ...item
    };
    this.liveFeedItems.unshift(newItem);
    if (this.liveFeedItems.length > 100) this.liveFeedItems.pop();
    this.persistDocument('liveFeedItems', newItem);
    return newItem;
  }

  // --- COMMENTS & AUTO-MODERATION ---
  getComments(articleId) {
    return this.comments
      .filter(c => c.articleId === articleId && !c.flagged)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  addComment(articleId, user, content) {
    const now = Date.now();
    const lastComment = this.userLastCommentTime.get(user._id) || 0;
    if (now - lastComment < 3000) {
      throw new Error('Comment throttling: Please wait 3 seconds before posting another comment.');
    }
    this.userLastCommentTime.set(user._id, now);

    const comment = {
      _id: `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      articleId,
      author: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      },
      content,
      flagCount: 0,
      flagged: false,
      createdAt: new Date().toISOString()
    };
    this.comments.unshift(comment);
    this.persistDocument('comments', comment);
    return comment;
  }

  flagComment(commentId) {
    const comment = this.comments.find(c => c._id === commentId);
    if (!comment) return null;
    comment.flagCount = (comment.flagCount || 0) + 1;
    if (comment.flagCount >= 3) {
      comment.flagged = true;
    }
    this.persistDocument('comments', comment);
    return comment;
  }

  // --- FORUM THREADS, REPLIES, & VOTES ---
  getForumThreads({ board = 'all', sort = 'recent' } = {}) {
    return this.forumThreads
      .filter(t => {
        if (t.flagged) return false;
        if (board !== 'all' && t.board.toLowerCase() !== board.toLowerCase()) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'top') {
          return (b.upvotes?.length - b.downvotes?.length) - (a.upvotes?.length - a.downvotes?.length);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }

  getThreadById(id) {
    return this.forumThreads.find(t => t._id === id);
  }

  getThreadBySourceUrl(sourceUrl) {
    if (!sourceUrl) return null;
    return this.forumThreads.find((thread) => thread.sourceUrl === sourceUrl) || null;
  }

  createForumThread({ board, title, content, sourceUrl = '', user }) {
    const thread = {
      _id: `thr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      board: board.toLowerCase(),
      title,
      content,
      sourceUrl,
      author: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      },
      upvotes: [],
      downvotes: [],
      replies: [],
      flagCount: 0,
      flagged: false,
      createdAt: new Date().toISOString()
    };
    this.forumThreads.unshift(thread);
    this.persistDocument('forumThreads', thread);
    return thread;
  }

  addForumReply(threadId, { content, user }) {
    const thread = this.getThreadById(threadId);
    if (!thread) throw new Error('Thread not found');

    const reply = {
      _id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      author: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      },
      content,
      createdAt: new Date().toISOString()
    };
    thread.replies.push(reply);
    this.persistDocument('forumThreads', thread);
    return reply;
  }

  voteForumThread(threadId, userId, direction = 'up') {
    const thread = this.getThreadById(threadId);
    if (!thread) throw new Error('Thread not found');

    if (!thread.upvotes) thread.upvotes = [];
    if (!thread.downvotes) thread.downvotes = [];

    const upIdx = thread.upvotes.indexOf(userId);
    const downIdx = thread.downvotes.indexOf(userId);

    if (direction === 'up') {
      if (upIdx >= 0) {
        thread.upvotes.splice(upIdx, 1);
      } else {
        thread.upvotes.push(userId);
        if (downIdx >= 0) thread.downvotes.splice(downIdx, 1);
      }
    } else {
      if (downIdx >= 0) {
        thread.downvotes.splice(downIdx, 1);
      } else {
        thread.downvotes.push(userId);
        if (upIdx >= 0) thread.upvotes.splice(upIdx, 1);
      }
    }

    this.persistDocument('forumThreads', thread);
    return { upvotes: thread.upvotes.length, downvotes: thread.downvotes.length };
  }

  flagForumThread(threadId) {
    const thread = this.getThreadById(threadId);
    if (!thread) return null;
    thread.flagCount = (thread.flagCount || 0) + 1;
    if (thread.flagCount >= 3) {
      thread.flagged = true;
    }
    this.persistDocument('forumThreads', thread);
    return thread;
  }

  // --- MODERATION QUEUE (Comments & Forum Threads) ---
  getFlaggedItems() {
    const flaggedComments = this.comments
      .filter(c => c.flagCount > 0)
      .map(c => ({
        type: 'comment',
        id: c._id,
        content: c.content,
        author: c.author?.name,
        flagCount: c.flagCount,
        flagged: c.flagged,
        createdAt: c.createdAt
      }));

    const flaggedThreads = this.forumThreads
      .filter(t => t.flagCount > 0)
      .map(t => ({
        type: 'thread',
        id: t._id,
        content: `${t.title} — ${t.content.slice(0, 100)}...`,
        author: t.author?.name,
        flagCount: t.flagCount,
        flagged: t.flagged,
        createdAt: t.createdAt
      }));

    return [...flaggedComments, ...flaggedThreads];
  }

  resolveFlaggedItem(type, id, action = 'approve') {
    if (type === 'comment') {
      const comment = this.comments.find(c => c._id === id);
      if (!comment) throw new Error('Comment not found');
      if (action === 'approve') {
        comment.flagCount = 0;
        comment.flagged = false;
        this.persistDocument('comments', comment);
      } else if (action === 'remove') {
        this.comments = this.comments.filter(c => c._id !== id);
        this.deleteDocument('comments', id);
      }
      return { success: true, action };
    } else {
      const thread = this.forumThreads.find(t => t._id === id);
      if (!thread) throw new Error('Thread not found');
      if (action === 'approve') {
        thread.flagCount = 0;
        thread.flagged = false;
        this.persistDocument('forumThreads', thread);
      } else if (action === 'remove') {
        this.forumThreads = this.forumThreads.filter(t => t._id !== id);
        this.deleteDocument('forumThreads', id);
      }
      return { success: true, action };
    }
  }

  // --- FACT CHECK LOGS & HITL OVERRIDES ---
  logFactCheckOverride({ articleId, editorId, claimIndex, originalStatus, overriddenStatus, reason }) {
    if (!reason || reason.trim().length < 15) {
      throw new Error('Guardrail violation: A minimum 15-character rationale is required for manual overrides.');
    }
    const editor = this.getUserById(editorId);
    const article = this.getArticleByIdOrSlug(articleId);

    const log = {
      _id: `fcl_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      articleId,
      articleTitle: article?.title || 'Unknown Article',
      editorName: editor?.name || 'Editorial Staff',
      claimIndex,
      originalStatus,
      overriddenStatus,
      reason: reason.trim(),
      timestamp: new Date().toISOString()
    };
    this.factCheckLogs.unshift(log);
    this.persistDocument('factCheckLogs', log);
    return log;
  }

  getFactCheckLogs() {
    return this.factCheckLogs;
  }
}

const store = new DataStore();
module.exports = store;
