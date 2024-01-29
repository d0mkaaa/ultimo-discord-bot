const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responds with Pong!'),
    async execute(interaction) {
        if (interaction.isCommand()) {
            const embed = new EmbedBuilder()
                .setColor(process.env.EMBED_COLOR || '#0099ff')
                .setTitle('Pong!')
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(process.env.EMBED_COLOR || '#0099ff')
                .setTitle('Pong!')
                .setTimestamp();
            interaction.channel.send({ embeds: [embed] });
        }
    }
};
