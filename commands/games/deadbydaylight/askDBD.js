const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');

let present = [];
let missing = [];
let later = [];

module.exports = {
    name: 'dbd',
    description: 'Demande qui est là pour dbd',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor('#A02D39')
            .setTitle(`Qui est chaud pour dbd ${args.join(' ')} ? `);

        const timestamp = new Date();
        const formattedDate = timestamp.toLocaleDateString();
        embed.addFields(
            { name: 'Présent :', value: `${present.length || 'Personne'}` },
            { name: 'Plus tard :', value: `${later.length || 'Personne'}` },
            { name: 'Pas disponible :', value: `${missing.length || 'Personne'}` }
        );

        embed.setFooter({ text: `Date: ${formattedDate}` });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('present')
                    .setLabel('Présent')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('later')
                    .setLabel('Plus tard')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('missing')
                    .setLabel('Pas disponible')
                    .setStyle(ButtonStyle.Danger)
            );

        const sentMessage = await message.channel.send({ content: '<@&1271852528379760783>', embeds: [embed], components: [row] });

        const filter = i => ['present', 'later', 'missing'].includes(i.customId);
        const collector = sentMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 43200000 });

        collector.on('collect', async i => {
            const userTag = i.user.tag;

            // Remove the user from all lists
            present = present.filter(tag => tag !== userTag);
            later = later.filter(tag => tag !== userTag);
            missing = missing.filter(tag => tag !== userTag);

            // Add the user to the selected list
            if (i.customId === 'present') {
                present.push(userTag);
            } else if (i.customId === 'later') {
                later.push(userTag);
            } else if (i.customId === 'missing') {
                missing.push(userTag);
            }

            // Update the embed with counts
            const updatedEmbed = new EmbedBuilder()
                .setColor('#A02D39')
                .setTitle('Qui est chaud pour dbd ?')
                .addFields(
                    { name: `Présent : ${present.length || '0'}`, value: `${present.join(" ") || 'Personne'}` },
                    { name: `Plus tard : ${later.length || '0'}`, value: `${later.join(" ") || 'Personne'}` },
                    { name: `Pas disponible : ${missing.length || '0'}`, value: `${missing.join(" ") || 'Personne'}` }
                )
                .setFooter({ text: `Date: ${formattedDate}` });

            await i.update({ embeds: [updatedEmbed], components: [row] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send('Le temps est écoulé sans aucune réponse.');
            }
        });
    },
};
