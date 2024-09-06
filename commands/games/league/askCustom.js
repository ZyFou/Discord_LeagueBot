const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');

let present = [];
let missing = [];
let later = [];

module.exports = {
    name: 'custom',
    description: 'Demande qui est là pour custom',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor('#ad9563')
            .setTitle(`Qui est chaud pour custom LOL ${args.join(' ')} ? `);

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

        const sentMessage = await message.channel.send({ content: '<@&1271852637116956742>', embeds: [embed], components: [row] });

        const filter = i => ['present', 'later', 'missing'].includes(i.customId);
        const collector = sentMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 43200000 });

        collector.on('collect', async i => {
            const member = i.guild.members.cache.get(i.user.id);
            const userName = member ? member.displayName : i.user.username;

            // Remove the user from all lists
            present = present.filter(tag => tag !== userName);
            later = later.filter(tag => tag !== userName);
            missing = missing.filter(tag => tag !== userName);

            // Add the user to the selected list
            if (i.customId === 'present') {
                present.push(userName);
            } else if (i.customId === 'later') {
                later.push(userName);
            } else if (i.customId === 'missing') {
                missing.push(userName);
            }

            // Update the embed with counts
            const updatedEmbed = new EmbedBuilder()
                .setColor('#ad9563')
                .setTitle(`Qui est chaud pour custom LOL ${args.join(' ')} ? `)
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
