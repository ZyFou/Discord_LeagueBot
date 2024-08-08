const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Ping command',
    execute(message, args) {
        // Calculate latency
        const latency = Math.abs(Date.now() - message.createdTimestamp);

        // Create an embedded message
        const embed = new EmbedBuilder()
            .setColor('#0099ff') // Set the embed color
            .setTitle('Pong 🏓') // Set the embed title
            .setDescription(`Le bot a un ping de : ${latency}ms`);

        const timestamp = new Date();
        const formattedDate = timestamp.toLocaleDateString();

        embed.setFooter({ text: `Date: ${formattedDate}` });

        // Log the author information for debugging
        // console.log(message.author.username);
        // console.log(message.author.id);

        message.channel.send({ embeds: [embed] });
    },
};
