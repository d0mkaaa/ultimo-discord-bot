const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const logger = require('./logger'); 
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        logger('info', `Command loaded: ${command.data.name}`);
    } else {
        logger('warn', `Skipped loading '${file}' as it does not export a 'data' property.`);
    }
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    logger('info', `Logged in as ${client.user.tag}!`);
    try {
        logger('info', 'Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        logger('info', 'Successfully reloaded application (/) commands.');
    } catch (error) {
        logger('error', `Error reloading application (/) commands: ${error.message}`);
    }
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
        logger('info', `Event loaded: ${event.name} (once)`);
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
        logger('info', `Event loaded: ${event.name}`);
    }
}

client.login(process.env.DISCORD_TOKEN);
