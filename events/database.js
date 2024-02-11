const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        if (process.env.LOGGING_METHOD === 'mongodb') {
            if (process.env.MONGODB_URI && /^mongodb(?:\+srv)?:\/\//.test(process.env.MONGODB_URI)) {
                mongoose.connect(process.env.MONGODB_URI)
                    .then(() => console.log('Connected to MongoDB'))
                    .catch(err => console.error(`Could not connect to MongoDB: ${err}`));
            } else {
                console.error('MongoDB connection string is invalid or not provided in .env.');
            }
        } else {
            console.log('MongoDB connection is not attempted due to LOGGING_METHOD setting.');
        }
    }
};
