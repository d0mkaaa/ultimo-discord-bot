require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        const prefix = process.env.DEFAULT_PREFIX;

        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName)) return;

        const command = client.commands.get(commandName);

        try {
            command.execute(message, args, EmbedBuilder);
        } catch (error) {
            console.error(error);
            message.channel.send('There was an error trying to execute that command!');
        }
    }
};
