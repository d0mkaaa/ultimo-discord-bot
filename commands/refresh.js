const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

module.exports = {
    name: 'refresh',
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Refreshes all slash commands (Admin only).'),
    async execute(interaction) {
        const successColor = process.env.SUCCESS_COLOR || '#00FF00';
        const errorColor = process.env.ERROR_COLOR || '#FF0000';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor(errorColor)
                .setTitle('Insufficient Permissions')
                .setDescription('You do not have permission to use this command.')
                .setTimestamp();
            return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true });
        }

        const commands = interaction.client.commands.map(cmd => cmd.data.toJSON());
        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

        try {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, interaction.guildId),
                { body: commands },
            );
            console.log(`Successfully reloaded application (/) commands for ${interaction.guild.name}.`);

            const successEmbed = new EmbedBuilder()
                .setColor(successColor)
                .setTitle('Commands Refreshed')
                .setDescription('All slash commands have been refreshed successfully.')
                .setTimestamp();
            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);

            const errorEmbed = new EmbedBuilder()
                .setColor(errorColor)
                .setTitle('Failed to Refresh Commands')
                .setDescription('An error occurred while refreshing commands.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
