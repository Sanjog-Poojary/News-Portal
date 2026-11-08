const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PORT, CLIENT_URL, JWT_SECRET } = require('./config');
const { startBreakingNewsPolling } = require('./jobs/breaking-news.job');
const { startRssFeedPolling } = require('./jobs/rss-feed.job');
const store = require('./data/store');

const authRoutes = require('./routes/auth.routes');
const articleRoutes = require('./routes/article.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const forumRoutes = require('./routes/forum.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*', // Allow development client on any local port
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io instance to express app so routes can broadcast events
app.set('io', io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forum', forumRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'News Publishing Portal API & WebSocket Server'
  });
});

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  socket.on('user:join', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  // Join article room for live discussions
  socket.on('article:join', (articleId) => {
    if (articleId) {
      socket.join(`article:${articleId}`);
    }
  });

  socket.on('article:leave', (articleId) => {
    if (articleId) {
      socket.leave(`article:${articleId}`);
    }
  });

  socket.on('disconnect', () => {
    // Clean socket disconnection
  });
});

async function startServer() {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured in server/.env before starting the API.');
    }

    await store.initialize();
    startBreakingNewsPolling(io);
    startRssFeedPolling(io);

    server.listen(PORT, () => {
      console.log(`[NEWS.PORTAL] Backend API running on http://localhost:${PORT}`);
      console.log(`[NEWS.PORTAL] Socket.io active on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[NEWS.PORTAL] Backend startup failed:', error);
    process.exitCode = 1;
  }
}

startServer();
