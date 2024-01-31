const mongoose = require('mongoose');
const logger = require('../logger');
require('dotenv').config();

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        if (process.env.LOGGING_METHOD !== 'json') {
            mongoose.connect(process.env.MONGODB_URI)
                .then(() => logger('info', 'Connected to MongoDB'))
                .catch(err => logger('error', `Could not connect to MongoDB: ${err}`));
        }
    }
};