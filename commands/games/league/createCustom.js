const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = './commands/games/league/customs/';

let team1 = [];
let team2 = [];

module.exports = {
    name: 'create',
    description: 'Créer les équipes pour custom et démarrer la sélection des rôles',
    async execute(message) {
        // Supprimer toutes les customs précédentes
        fs.readdirSync(path).forEach(file => fs.unlinkSync(`${path}${file}`));

        const embed = new EmbedBuilder()
            .setColor('#ad9563')
            .setTitle("Création d'une game Custom")
            .setDescription('Choisissez votre équipe');

        const timestamp = new Date();
        const formattedDate = timestamp.toLocaleDateString();

        embed.addFields(
            { name: 'Équipe 1 :', value: `${team1.join(', ') || 'Aucun membre'}` },
            { name: 'Équipe 2 :', value: `${team2.join(', ') || 'Aucun membre'}` }
        );

        embed.setFooter({ text: `Date: ${formattedDate}` });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('team1')
                    .setLabel('Équipe 1')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('team2')
                    .setLabel('Équipe 2')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Démarrer La Custom')
                    .setStyle(ButtonStyle.Secondary)
            );

        const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = i => ['team1', 'team2', 'confirm'].includes(i.customId);
        const collector = sentMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 120000 });

        collector.on('collect', async i => {
            const member = i.guild.members.cache.get(i.user.id);
            const userName = member ? member.displayName : i.user.username;

            if (i.customId === 'team1') {
                if (team1.includes(userName)) {
                    team1 = team1.filter(member => member !== userName);
                } else {
                    if (team2.includes(userName)) {
                        team2 = team2.filter(member => member !== userName);
                    }
                    team1.push(userName);
                }
            } else if (i.customId === 'team2') {
                if (team2.includes(userName)) {
                    team2 = team2.filter(member => member !== userName);
                } else {
                    if (team1.includes(userName)) {
                        team1 = team1.filter(member => member !== userName);
                    }
                    team2.push(userName);
                }
            } else if (i.customId === 'confirm') {
                const fileId = `${Date.now()}`;

                const resultEmbed = new EmbedBuilder()
                    .setColor('#6bd13f')
                    .setTitle(`Custom bien créee :`)
                    .addFields(
                        { name: `Équipe 1 : ${team1.length} Drafter`, value: `${team1.join('\n') || 'Aucun membre'}` },
                        { name: `Équipe 2 : ${team2.length} Drafter`, value: `${team2.join('\n') || 'Aucun membre'}` }
                    )
                    .setFooter({ text: `Date: ${formattedDate}` });

                await i.update({ embeds: [resultEmbed], components: [] });

                const data = {
                    team1: team1,
                    team2: team2,
                    timestamp: timestamp.toISOString()
                };

                fs.writeFileSync(`${path}${fileId}.json`, JSON.stringify(data, null, 2));
                collector.stop();

                // Start role selection
                startRoleSelection(message, fileId);
                return;
            }

            const updatedEmbed = new EmbedBuilder()
                .setColor('#ad9563')
                .setTitle("Création d'une game Custom")
                .setDescription('Choisissez votre équipe')
                .addFields(
                    { name: `Équipe 1 : ${team1.length} Drafter`, value: `${team1.join('\n') || 'Aucun membre'}` },
                    { name: `Équipe 2 : ${team2.length} Drafter`, value: `${team2.join('\n') || 'Aucun membre'}` }
                )
                .setFooter({ text: `Date: ${formattedDate}` });

            await i.update({ embeds: [updatedEmbed], components: [row] });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send('Le temps est écoulé sans aucune confirmation.');
            }
        });
    },
};

async function startRoleSelection(message, gameId) {
    const filePath = `./commands/games/league/customs/${gameId}.json`;

    if (!fs.existsSync(filePath)) {
        return message.channel.send('Erreur : Aucun fichier trouvé pour l\'ID fourni.');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const team1 = data.team1;
    const team2 = data.team2;
    const players = [...team1, ...team2];

    const lanes = {
        top: [],
        jungle: [],
        mid: [],
        bot: [],
        support: []
    };

    const laneEmojis = {
        top: '<:lol_new_top:1270053441120768113>',
        jungle: '<:lol_new_jung:1270053458220683324>',
        mid: '<:lol_new_mid:1270053475136442409>',
        bot: '<:lol_new_bot:1270053491746013257>',
        support: '<:lol_new_supp:1270053505348141096>'
    };

    const laneEmojis_red = {
        top: '<:lol_new_top_red:1270058347198021716>',
        jungle: '<:lol_new_jung_red:1270058329221107774>',
        mid: '<:lol_new_mid_red:1270058310154059817>',
        bot: '<:lol_new_bot_red:1270058290851877047>',
        support: '<:lol_new_supp_red:1270058254528938105>'
    };

    const laneEmojis_blue = {
        top: '<:lol_new_top_blue:1270058338239123476>',
        jungle: '<:lol_new_jung_blue:1270058320899604502>',
        mid: '<:lol_new_mid_blue:1270058300469411880>',
        bot: '<:lol_new_bot_blue:1270058280382631987>',
        support: '<:lol_new_supp_blue:1270058243154116639>'
    };

    const laneButtons = [
        new ButtonBuilder().setCustomId('top').setLabel('Top').setStyle(ButtonStyle.Secondary).setEmoji(laneEmojis["top"]),
        new ButtonBuilder().setCustomId('jungle').setLabel('Jungle').setStyle(ButtonStyle.Secondary).setEmoji(laneEmojis["jungle"]),
        new ButtonBuilder().setCustomId('mid').setLabel('Mid').setStyle(ButtonStyle.Secondary).setEmoji(laneEmojis["mid"]),
        new ButtonBuilder().setCustomId('bot').setLabel('Bot').setStyle(ButtonStyle.Secondary).setEmoji(laneEmojis["bot"]),
        new ButtonBuilder().setCustomId('support').setLabel('Supp').setStyle(ButtonStyle.Secondary).setEmoji(laneEmojis["support"])
    ];

    const row = new ActionRowBuilder().addComponents(laneButtons);

    const embed = new EmbedBuilder()
        .setColor('#ad9563')
        .setTitle("Sélection des rôles de lane")
        .setDescription('Cliquez sur un bouton pour sélectionner votre rôle.')
        .addFields(
            { name: `Top `, value: 'Aucun membre', inline: false },
            { name: `Jungle `, value: 'Aucun membre', inline: false },
            { name: `Mid `, value: 'Aucun membre', inline: false },
            { name: `Bot `, value: 'Aucun membre', inline: false },
            { name: `Supp `, value: 'Aucun membre', inline: false }
        );

    // await message.channel.send("<@1228254454483124226> le smite");
    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = i => ['top', 'jungle', 'mid', 'bot', 'support'].includes(i.customId);
    const collector = sentMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button });

    collector.on('collect', async i => {
        const member = i.guild.members.cache.get(i.user.id);
        const userName = member ? member.displayName : i.user.username;

        if (!players.includes(userName)) {
            return i.reply({ content: 'Vous ne faites pas partie de cette custom.', ephemeral: true });
        }

        const role = i.customId;

        // Remove the user from any other lane
        for (const lane in lanes) {
            lanes[lane] = lanes[lane].filter(member => member.username !== userName);
        }

        // Add the user to the selected lane
        lanes[role].push({
            username: userName,
            team: team1.includes(userName) ? 'blue' : 'red'
        });

        const updatedFields = Object.keys(lanes).map(lane => ({
            name: `${lane.charAt(0).toUpperCase() + lane.slice(1)}`,
            value: lanes[lane].map(member => {
                const emoji = member.team === 'red' ? laneEmojis_red[lane] : laneEmojis_blue[lane];
                return `${emoji} ${member.username}`;
            }).join('\n') || 'Aucun membre',
            inline: false
        }));

        const updatedEmbed = new EmbedBuilder()
            .setColor('#ad9563')
            .setTitle("Sélection des rôles de lane")
            .setDescription('Cliquez sur un bouton pour sélectionner votre rôle.')
            .addFields(updatedFields);

        await i.update({ embeds: [updatedEmbed], components: [row] });
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            message.channel.send('Le temps est écoulé sans sélection des rôles.');
        }
    });
}
