const { CommandInteraction, Client } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fonction pour ajouter un délai
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'move',
    description: 'Déplacer les membres des équipes dans des salons vocaux spécifiques',
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        // Définir les IDs des salons vocaux ici
        const team1ChannelId = '1166405615032225894';
        const team2ChannelId = '1270328314300596308';

        // Chercher le dernier fichier custom créé
        const customsFolder = './commands/games/league/customs/';
        const customFiles = fs.readdirSync(customsFolder)
            .map(fileName => ({
                name: fileName,
                time: fs.statSync(path.join(customsFolder, fileName)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (customFiles.length === 0) {
            return interaction.reply({ content: 'Erreur : Aucun fichier de custom trouvé.', ephemeral: true });
        }

        const latestCustomFile = customFiles[0].name;
        const filePath = path.join(customsFolder, latestCustomFile);

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const team1 = data.team1;
        const team2 = data.team2;

        const guild = interaction.guild;

        if (!guild) {
            return interaction.reply({ content: 'Erreur : Impossible de trouver la guilde.', ephemeral: true });
        }

        const team1Channel = guild.channels.cache.get(team1ChannelId);
        const team2Channel = guild.channels.cache.get(team2ChannelId);

        if (!team1Channel || !team2Channel) {
            return interaction.reply({ content: 'Erreur : Impossible de trouver l\'un des salons vocaux.', ephemeral: true });
        }

        await interaction.reply({ content: 'Déplacement des membres en cours...' });

        for (const memberTag of team1) {
            const member = guild.members.cache.find(m => m.user.tag === memberTag);
            if (member) {
                if (member.voice.channelId && member.voice.channelId !== team1ChannelId) {
                    await member.voice.setChannel(team1Channel);
                    console.log(`Déplacé ${member.user.tag} vers ${team1Channel.name}`);
                } else {
                    console.log(`${member.user.tag} est déjà dans le salon ${team1Channel.name}`);
                }
            } else {
                console.log(`Membre avec tag ${memberTag} non trouvé dans la guilde.`);
            }
            await delay(500); // Ajouter un délai de 1 seconde entre chaque requête
        }

        for (const memberTag of team2) {
            const member = guild.members.cache.find(m => m.user.tag === memberTag);
            if (member) {
                if (member.voice.channelId && member.voice.channelId !== team2ChannelId) {
                    await member.voice.setChannel(team2Channel);
                    console.log(`Déplacé ${member.user.tag} vers ${team2Channel.name}`);
                } else {
                    console.log(`${member.user.tag} est déjà dans le salon ${team2Channel.name}`);
                }
            } else {
                console.log(`Membre avec tag ${memberTag} non trouvé dans la guilde.`);
            }
            await delay(500); // Ajouter un délai de 1 seconde entre chaque requête
        }

        await interaction.reply({ content: 'Joueurs déplacés avec succés' });

    }
};
