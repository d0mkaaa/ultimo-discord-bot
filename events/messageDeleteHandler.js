const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (message.partial) {
            console.error('A message was deleted, but it was not cached.');
            return;
        }

        let content = message.content || 'No text content';
        let imageUrl = null;

        if (message.attachments.size > 0) {
            imageUrl = message.attachments.first().proxyURL;
            content += `\n[View Attachment](${imageUrl})`;
        }

        const logDetails = {
            action: 'Message Deleted',
            targetId: message.author.id,
            executorId: message.author.id,
            reason: 'Message Deleted',
            messageContent: content,
            channelId: message.channel.id,
            messageId: message.id,
            level: 'info',
            imageUrl: imageUrl
        };

        logger(message.client, logDetails);
    }
};
