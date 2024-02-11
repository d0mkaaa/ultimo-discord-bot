const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responds with Pong! and shows the bot latency and API ping.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
        const embed = new EmbedBuilder()
            .setColor(process.env.EMBED_COLOR || '#0099ff')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Round Trip Latency', value: `${timeDiff}ms`, inline: true },
                { name: 'WebSocket Ping', value: `${interaction.client.ws.ping}ms`, inline: true }
            )
            .setTimestamp();
        await interaction.editReply({ content: ' ', embeds: [embed] });
    }
};
