const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const logger = require('../../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears a specified number of messages from a channel.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('The number of messages to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.ERROR_COLOR || '#FF0000').setDescription('You do not have permission to clear messages.')], ephemeral: true });
            logger(interaction.client, {
                level: 'warn',
                message: `${interaction.user.tag} attempted to clear messages without permission.`,
                action: 'Attempted Clear Messages',
                targetId: interaction.channel.id,
                executorId: interaction.user.id,
                reason: 'Lack of Permissions'
            });
            return;
        }

        const amount = interaction.options.getInteger('amount');

        interaction.channel.bulkDelete(amount, true).then(messages => {
            interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.SUCCESS_COLOR || '#00FF00').setDescription(`Successfully deleted ${messages.size} message(s).`)], ephemeral: true });
            logger(interaction.client, {
                action: 'Clear Messages',
                targetId: interaction.channel.id,
                executorId: interaction.user.id,
                reason: `Cleared ${messages.size} messages`,
                level: 'info',
            });
        }).catch(error => {
            console.error(error);
            interaction.reply({ embeds: [new EmbedBuilder().setColor(process.env.ERROR_COLOR || '#FF0000').setDescription('Failed to delete messages.')], ephemeral: true });
            logger(interaction.client, {
                level: 'error',
                message: `Error clearing messages in ${interaction.channel.id}: ${error.message}`,
                action: 'Failed Clear Messages',
                targetId: interaction.channel.id,
                executorId: interaction.user.id,
                reason: error.message
            });
        });
    },
};
