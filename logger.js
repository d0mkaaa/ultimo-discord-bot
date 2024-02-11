const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
require('dotenv').config();
const Log = require('./schemas/Log');

const logFilePath = path.join(__dirname, 'bot.log.json');

async function logToDiscordChannel(client, details) {
    const logsChannelId = process.env.LOGS_CHANNEL_ID;
    if (!logsChannelId) return;
    const channel = await client.channels.fetch(logsChannelId).catch(console.error);
    if (!channel) return;

    const embedColor = process.env.EMBED_COLOR || '#0099FF';

    const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`${details.action} Log`)
        .setTimestamp();

    if (details.targetId) embed.addFields({ name: 'Target', value: `<@${details.targetId}>` });
    if (details.executorId) embed.addFields({ name: 'Executor', value: `<@${details.executorId}>` });
    if (details.reason) embed.addFields({ name: 'Reason', value: details.reason });
    if (details.messageContent) embed.addFields({ name: 'Content', value: details.messageContent });
    if (details.imageUrl) embed.setImage(details.imageUrl);
    if (details.duration) embed.addFields({ name: 'Duration', value: `${details.duration} minutes` });

    await channel.send({ embeds: [embed] }).catch(console.error);
}

function logger(client, details) {
    if (details.level === 'warn' || details.level === 'error') {
        console[details.level](`${details.action}: ${details.message}`);
    } else {
        if (process.env.LOGGING_METHOD === 'mongodb') {
            const logEntry = new Log({ ...details, timestamp: new Date() });
            logEntry.save().catch(error => console.error('Error saving log to MongoDB', error));
        } else if (process.env.LOGGING_METHOD === 'channel') {
            logToDiscordChannel(client, details);
        } else {
            const logEntry = JSON.stringify({ ...details, timestamp: new Date().toISOString() }) + "\n";
            fs.appendFile(logFilePath, logEntry, err => {
                if (err) console.error('Error appending log to file', err);
            });
        }
    }
}

module.exports = logger;
