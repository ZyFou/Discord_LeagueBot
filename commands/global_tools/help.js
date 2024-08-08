const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Affiche toutes les commandes disponibles et leurs descriptions',
    execute(message) {
        const commands = {
            help: {
                description: 'Affiche ce message',
                usage: '!help'
            },
            ping: {
                description: 'Affiche le ping du bot',
                usage: '!ping'
            },
            info: {
                description: 'Affiche les informations sur le joueur spécifié',
                usage: '!info <Pseudo#XXXXX>'
            },
            custom: {
                description: 'Demande qui est là pour custom',
                usage: '!custom <heure> (optionnel)'
            },
            create: {
                description: 'Démarre la création de la custom',
                usage: '!create'
            },
            move: {
                description: 'Déplace les joueurs pour la custom',
                usage: '!move'
            },
            timer: {
                description: 'Démarre un timer avec la durée donnée',
                usage: '!timer <durée> <unitée> (s, m, h)'
            }
        };

        const commandsArray = Object.entries(commands);
        const commandsPerPage = 4;
        const totalPages = Math.ceil(commandsArray.length / commandsPerPage);

        let currentPage = 0;

        const embed = createEmbed(currentPage, commandsArray, commandsPerPage, totalPages);

        const row = createButtonRow(currentPage, totalPages);

        message.channel.send({ embeds: [embed], components: [row] }).then(sentMessage => {
            const filter = i => {
                return i.user.id === message.author.id;
            };

            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'prev') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (i.customId === 'next') {
                    currentPage = Math.min(totalPages - 1, currentPage + 1);
                }

                await i.update({ embeds: [createEmbed(currentPage, commandsArray, commandsPerPage, totalPages)], components: [createButtonRow(currentPage, totalPages)] });
            });

            collector.on('end', () => {
                row.components.forEach(button => button.setDisabled(true));
                sentMessage.edit({ components: [row] });
            });
        });
    },
};

function createEmbed(page, commandsArray, commandsPerPage, totalPages) {
    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Commandes disponibles')
        .setDescription('Voici la liste des commandes disponibles et comment les utiliser :');

    const start = page * commandsPerPage;
    const end = start + commandsPerPage;
    const currentCommands = commandsArray.slice(start, end);

    currentCommands.forEach(([command, info]) => {
        embed.addFields({ name: `**__${command}__**`, value: `**Description:** ${info.description}\n**Usage:** \`${info.usage}\`` });
    });

    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString();
    embed.setFooter({ text: `Page ${page + 1} sur ${totalPages} | Date: ${formattedDate}` });

    return embed;
}

function createButtonRow(currentPage, totalPages) {
    const row = new ActionRowBuilder();

    const prevButton = new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('Page Précédente')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0);

    const nextButton = new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Page Suivante')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage >= totalPages - 1);

    row.addComponents(prevButton, nextButton);
    return row;
}
