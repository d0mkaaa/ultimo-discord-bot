const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../logger'); 
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true)),
    async execute(interaction) {
        const errorColor = process.env.ERROR_COLOR || '#FF0000';
        const warningColor = process.env.WARNING_COLOR || '#FFA500';
        const successColor = process.env.SUCCESS_COLOR || '#00FF00';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            const embed = new EmbedBuilder()
                .setColor(errorColor)
                .setDescription('You do not have permission to use this command.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            logger('warn', `${interaction.user.tag} attempted to use the kick command without permission.`);
            return;
        }

        const target = interaction.options.getMember('target');
        if (!target || !target.kickable) {
            const embed = new EmbedBuilder()
                .setColor(warningColor)
                .setDescription('I cannot kick this user.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            logger('warn', `Failed to kick ${target ? target.user.tag : 'an unknown user'} - Not kickable.`);
            return;
        }

        await target.kick();
        const embed = new EmbedBuilder()
            .setColor(successColor)
            .setDescription(`${target.user.tag} has been kicked.`);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        logger('info', `${target.user.tag} was kicked by ${interaction.user.tag}.`);
    },
};
