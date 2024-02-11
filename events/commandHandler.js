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
            if (command.data) {
                client.commands.set(command.data.name, command);
                console.log(`Slash command loaded: ${command.data.name}`);
            }
        }
    },
};
