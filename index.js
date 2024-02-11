const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildModeration]
});

client.commands = new Collection();
const commands = [];

function loadCommands(directory) {
    const commandFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(directory, file);
        const command = require(filePath);
        if (command.data) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            console.log(`Command loaded: ${command.data.name}`);
        } else {
            console.log(`Skipped loading '${file}' as it does not export a 'data' property.`);
        }
    }

    const subdirectories = fs.readdirSync(directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    subdirectories.forEach(subdir => {
        loadCommands(path.join(directory, subdir));
    });
}

loadCommands(path.join(__dirname, 'commands'));

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(`Error reloading application (/) commands: ${error.message}`);
    }
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
        console.log(`Event loaded: ${event.name} (once)`);
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
        console.log(`Event loaded: ${event.name}`);
    }
}

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


client.login(process.env.DISCORD_TOKEN);
