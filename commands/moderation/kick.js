const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../logger');
require('dotenv').config();

module.exports = {
    name: 'kick',
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server.')
        .addUserOption(option => option.setName('target').setDescription('The member to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for kicking the member').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.ERROR_COLOR || '#FF0000').setDescription('You do not have permission to use this command.')], ephemeral: true });
            logger(interaction.client, { level: 'warn', message: `${interaction.user.tag} attempted to use the kick command without permission.` });
            return;
        }

        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason');

        if (target.id === interaction.user.id) {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.ERROR_COLOR || '#FF0000').setDescription("You cannot kick yourself.")], ephemeral: true });
            logger(interaction.client, { level: 'warn', message: `${interaction.user.tag} attempted to kick themselves.` });
            return;
        }

        if (!target.kickable) {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.ERROR_COLOR || '#FF0000').setDescription('I cannot kick this user.')], ephemeral: true });
            logger(interaction.client, { level: 'warn', message: `Failed to kick ${target.user.tag} - Not kickable.` });
            return;
        }

        await target.kick(reason);
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.SUCCESS_COLOR || '#00FF00').setDescription(`${target.user.tag} has been kicked for: ${reason}`)], ephemeral: true });
        logger(interaction.client, {
            level: 'info',
            action: 'Kick',
            targetId: target.id,
            executorId: interaction.user.id,
            reason: reason
        });
    },
};
