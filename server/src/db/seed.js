const {
  seedUsers,
  seedBreakingNews,
  seedArticles,
  seedComments,
  seedForumThreads,
  seedFactCheckLogs
} = require('../data/seedData');
const { connectDatabase, disconnectDatabase } = require('./connection');
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const ForumThread = require('../models/ForumThread');
const BreakingNews = require('../models/BreakingNews');
const FactCheckLog = require('../models/FactCheckLog');

async function upsertDocuments(Model, documents) {
  if (!documents.length) return;

  await Model.bulkWrite(
    documents.map((document) => ({
      updateOne: {
        filter: { _id: document._id || document.id },
        update: { $set: { ...document, _id: document._id || document.id } },
        upsert: true
      }
    }))
  );
}

async function seedDatabase() {
  await connectDatabase();

  await upsertDocuments(User, seedUsers);
  await upsertDocuments(Article, seedArticles);
  await upsertDocuments(Comment, seedComments);
  await upsertDocuments(ForumThread, seedForumThreads);
  await upsertDocuments(
    BreakingNews,
    seedBreakingNews.map(({ id, ...item }) => ({ ...item, _id: id }))
  );
  await upsertDocuments(FactCheckLog, seedFactCheckLogs);

  console.log('[NEWS.PORTAL] Demo data seeded into MongoDB.');
}

seedDatabase()
  .catch((error) => {
    console.error('[NEWS.PORTAL] MongoDB seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
