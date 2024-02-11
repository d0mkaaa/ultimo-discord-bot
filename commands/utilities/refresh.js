const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const logger = require('../../logger');
require('dotenv').config();

module.exports = {
    name: 'refresh',
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Refreshes all slash commands (Admin only).'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR || '#FF0000')
                .setTitle('Insufficient Permissions')
                .setDescription('You do not have permission to use this command.')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            logger(interaction.client, {
                level: 'warn',
                message: `${interaction.user.tag} attempted to use the refresh command without sufficient permissions.`,
                action: 'Insufficient Permissions',
                targetId: interaction.user.id,
                executorId: interaction.user.id,
                reason: 'Attempted to use refresh command without permissions'
            });
            return;
        }

        const commands = [];
        const commandsPath = path.join(__dirname, '../../commands');

        const loadCommands = (dir) => {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            files.forEach(file => {
                if (file.isDirectory()) {
                    loadCommands(path.join(dir, file.name));
                } else if (file.name.endsWith('.js')) {
                    const filePath = path.join(dir, file.name);
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);
                    if (command.data) commands.push(command.data.toJSON());
                }
            });
        };

        loadCommands(commandsPath);

        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

        try {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, interaction.guildId),
                { body: commands },
            );
            const successEmbed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR || '#00FF00')
                .setTitle('Commands Refreshed')
                .setDescription('All slash commands have been refreshed successfully.')
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            logger(interaction.client, {
                level: 'info',
                message: `Successfully reloaded application (/) commands for ${interaction.guild.name}.`,
                action: 'Refresh Commands',
                targetId: interaction.user.id,
                executorId: interaction.user.id,
                reason: 'Command refresh executed'
            });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR || '#FF0000')
                .setTitle('Failed to Refresh Commands')
                .setDescription('An error occurred while refreshing commands.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            logger(interaction.client, {
                level: 'error',
                message: `Error reloading application (/) commands for ${interaction.guild.name}: ${error.message}`,
                action: 'Refresh Commands Error',
                targetId: interaction.user.id,
                executorId: interaction.user.id,
                reason: error.message
            });
        }
    },
};
