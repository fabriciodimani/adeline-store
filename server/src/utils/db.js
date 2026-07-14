const mongoose = require('mongoose');

async function connectMongo(uri) {
  await mongoose.connect(uri);
  console.log('[mongo] conectado');
}

module.exports = { connectMongo };
