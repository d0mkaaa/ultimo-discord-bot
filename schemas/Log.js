const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: String,
  message: String,
  action: String,
  targetId: String,
  executorId: String,
  reason: String,
  duration: Number,
  messageContent: String,
  imageUrl: String,
});

const Log = mongoose.model('Logs', logSchema);

module.exports = Log;
