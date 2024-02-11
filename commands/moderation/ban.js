const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../logger');
require('dotenv').config();

module.exports = {
    name: 'ban',
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server.')
        .addUserOption(option => option.setName('target').setDescription('The member to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for banning the member').setRequired(false)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            const embed = new EmbedBuilder()
                .setColor(process.env.ERROR_COLOR || '#FF0000')
                .setDescription('You do not have permission to use this command.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            logger(interaction.client, {
                level: 'warn',
                message: `${interaction.user.tag} attempted to use the ban command without permission.`
            });
            return;
        }

        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const member = await interaction.guild.members.fetch(target.id);
            if (!member.bannable) {
                const embed = new EmbedBuilder()
                    .setColor(process.env.ERROR_COLOR || '#FF0000')
                    .setDescription('I cannot ban this user or they are not found.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                logger(interaction.client, {
                    level: 'error',
                    message: `Failed to ban ${target.tag} - Not bannable or not found.`
                });
                return;
            }

            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setColor(process.env.SUCCESS_COLOR || '#00FF00')
                .setDescription(`${target.tag} has been banned for: ${reason}`);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            logger(interaction.client, {
                action: 'Ban',
                targetId: target.id,
                executorId: interaction.user.id,
                reason: reason,
                level: 'info',
            });
        } catch (error) {
            console.error(error);
            logger(interaction.client, {
                level: 'error',
                message: `Error executing ban command: ${error.message}`
            });
        }
    },
};
