const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

module.exports = {
    name: 'commandHandler',
    execute(client) {
        client.commands = new Collection();
        const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(__dirname, `../commands/${file}`));
            client.commands.set(command.name, command);
            console.log(`Command loaded: ${command.name}`);
        }

        client.on('messageCreate', message => {
            if (!message.content.startsWith('!') || message.author.bot) return;
            
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (!client.commands.has(commandName)) {
                console.log(`Command not found: ${commandName}`);
                return;
            }

            const command = client.commands.get(commandName);

            try {
                command.execute(message, args);
                console.log(`Executed command: ${commandName}`);
            } catch (error) {
                console.error(error);
                message.reply('There was an error trying to execute that command!');
                console.log(`Failed to execute command: ${commandName}`);
            }
        });
    },
};
