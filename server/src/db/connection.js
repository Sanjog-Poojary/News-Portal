const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(MONGO_URI);
  console.log(`[NEWS.PORTAL] MongoDB connected to ${MONGO_URI}`);
  return mongoose.connection;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};
