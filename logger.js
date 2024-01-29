const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const logSchema = new mongoose.Schema({
    timestamp: Date,
    level: String,
    message: String,
});
const Log = mongoose.model('Log', logSchema);

const logFilePath = path.join(__dirname, 'bot.log.json');

function logToJSON(level, message) {
    const logEntry = JSON.stringify({ timestamp: new Date().toISOString(), level, message }) + "\n";
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error appending log to file', err);
        }
    });
}

async function logToMongoDB(level, message) {
    const logEntry = new Log({ timestamp: new Date(), level, message });
    try {
        await logEntry.save();
    } catch (error) {
        console.error('Error saving log to MongoDB', error);
    }
}

function logger(level, message) {
    if (process.env.LOGGING_METHOD === 'mongodb') {
        logToMongoDB(level, message);
    } else {
        logToJSON(level, message);
    }
}

module.exports = logger;
