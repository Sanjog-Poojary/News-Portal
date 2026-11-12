const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('news_portal_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- ARTICLE & FEED APIS ---
export async function fetchArticles({ category = 'All', search = '', status = 'published', authorId = '' } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (authorId) params.append('authorId', authorId);

  const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

export async function fetchFeatured() {
  const res = await fetch(`${API_BASE}/articles/featured`);
  if (!res.ok) throw new Error('Failed to fetch featured articles');
  return res.json();
}

export async function fetchBreakingNews() {
  const res = await fetch(`${API_BASE}/articles/breaking`);
  if (!res.ok) throw new Error('Failed to fetch breaking news');
  return res.json();
}

export async function fetchLiveFeed(limit = 30) {
  const res = await fetch(`${API_BASE}/articles/live?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch live feed');
  return res.json();
}

export async function fetchArticle(id) {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch article details');
  return res.json();
}

export async function toggleLike(id) {
  const res = await fetch(`${API_BASE}/articles/${id}/like`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to toggle like');
  return res.json();
}

export async function toggleBookmark(id) {
  const res = await fetch(`${API_BASE}/articles/${id}/bookmark`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to toggle bookmark');
  return res.json();
}

// --- AUTHOR DASHBOARD & AI SCAN APIS ---
export async function fetchAuthorMetrics() {
  const res = await fetch(`${API_BASE}/articles/author/metrics`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch author metrics');
  return res.json();
}

export async function scanArticleDraft(title, body) {
  const res = await fetch(`${API_BASE}/articles/scan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, body })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to scan draft');
  }
  return res.json();
}

export async function createArticle(articleData) {
  const res = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(articleData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create article');
  }
  return res.json();
}

export async function updateArticle(id, articleData) {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(articleData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update article');
  }
  return res.json();
}

// --- COMMENTS APIS ---
export async function fetchComments(articleId) {
  const res = await fetch(`${API_BASE}/comments/${articleId}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function postComment(articleId, content) {
  const res = await fetch(`${API_BASE}/comments/${articleId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to post comment');
  }
  return res.json();
}

export async function flagComment(commentId) {
  const res = await fetch(`${API_BASE}/comments/${commentId}/flag`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to flag comment');
  return res.json();
}

// --- FORUM APIS ---
export async function fetchForumThreads({ board = 'all', sort = 'recent' } = {}) {
  const params = new URLSearchParams();
  if (board && board !== 'all') params.append('board', board);
  if (sort) params.append('sort', sort);

  const res = await fetch(`${API_BASE}/forum/threads?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch forum threads');
  return res.json();
}

export async function fetchForumThreadBySource(sourceUrl) {
  const params = new URLSearchParams({ sourceUrl });
  const res = await fetch(`${API_BASE}/forum/threads/by-source?${params.toString()}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to find existing discussion');
  return res.json();
}

export async function createForumThread({ board, title, content, sourceUrl = '' }) {
  const res = await fetch(`${API_BASE}/forum/threads`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ board, title, content, sourceUrl })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create thread');
  }
  return res.json();
}

export async function postForumReply(threadId, content) {
  const res = await fetch(`${API_BASE}/forum/threads/${threadId}/reply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to post reply');
  }
  return res.json();
}

export async function voteForumThread(threadId, direction = 'up') {
  const res = await fetch(`${API_BASE}/forum/threads/${threadId}/vote`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ direction })
  });
  if (!res.ok) throw new Error('Failed to submit vote');
  return res.json();
}

export async function flagForumThread(threadId) {
  const res = await fetch(`${API_BASE}/forum/threads/${threadId}/flag`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to flag thread');
  return res.json();
}

// --- ADMIN APIS (RBAC, Moderation, Audit Logs, Broadcast) ---
export async function fetchAdminUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch user list');
  return res.json();
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update user role');
  }
  return res.json();
}

export async function fetchModerationQueue() {
  const res = await fetch(`${API_BASE}/admin/moderation`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch moderation queue');
  return res.json();
}

export async function resolveModerationItem(type, id, action) {
  const res = await fetch(`${API_BASE}/admin/moderation/${id}/resolve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ type, action })
  });
  if (!res.ok) throw new Error('Failed to resolve moderation item');
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function overrideFactCheckClaim({ articleId, claimIndex, overriddenStatus, reason }) {
  const res = await fetch(`${API_BASE}/admin/override-claim`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ articleId, claimIndex, overriddenStatus, reason })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to override claim');
  }
  return res.json();
}

export async function broadcastBreakingNews({ headline, category, urgency }) {
  const res = await fetch(`${API_BASE}/admin/breaking`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ headline, category, urgency })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to broadcast breaking news');
  }
  return res.json();
}

// --- AUTH APIS ---
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return null;
  return res.json();
}

