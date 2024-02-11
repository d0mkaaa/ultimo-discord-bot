const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../logger');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription("Temporarily timeout's a member in the server.")
        .addUserOption(option =>
            option.setName('target').setDescription('The member to timeout').setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration').setDescription('Duration of the timeout in minutes').setRequired(true))
        .addStringOption(option =>
            option.setName('reason').setDescription('The reason for timeouting the member').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.ERROR_COLOR || '#FF0000').setDescription('You do not have permission to use this command.')], ephemeral: true });
            logger(interaction.client, {
                level: 'warn',
                message: `${interaction.user.tag} attempted to use the timeout command without permission.`
            });
            return;
        }

        const target = interaction.options.getMember('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason');

        if (!target.manageable) {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.ERROR_COLOR || '#FF0000').setDescription('I cannot timeout this user.')], ephemeral: true });
            logger(interaction.client, {
                level: 'warn',
                message: `Failed to timeout ${target.user.tag} - Not manageable.`,
                action: 'Timeout Attempt Failed',
                targetId: target.id,
                executorId: interaction.user.id,
                reason: 'Not manageable'
            });
            return;
        }

        await target.timeout(duration * 60000, reason);
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.SUCCESS_COLOR || '#00FF00').setDescription(`${target.user.tag} has been timed out for ${duration} minutes. Reason: ${reason}`)], ephemeral: true });
        logger(interaction.client, {
            action: 'Timeout',
            targetId: target.id,
            executorId: interaction.user.id,
            reason: reason,
            duration: duration,
            level: 'info',
        });
    },
};
