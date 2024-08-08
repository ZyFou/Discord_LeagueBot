const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fetch = require('node-fetch'); // Assurez-vous d'installer cette bibliothèque
const Jimp = require('jimp'); // Assurez-vous d'installer cette bibliothèque

require('dotenv').config();
const fs = require('fs');
const path = require('path');

var api_key = process.env.API_KEY;

module.exports = {
    name: 'info',
    description: 'Affiche le profil d\'un joueur League of Legends',
    async execute(message, args) {
        if (args.length < 1) {
            return message.channel.send('Veuillez fournir le profil du joueur sous la forme `RiotID#Tagline`. Exemple : `!info ZyFod#0801`');
        }

        const userInput = args[0]; // L'argument unique
        const [riotId, tagLine] = userInput.split('#'); // Séparez au niveau du #

        if (!riotId || !tagLine) {
            return message.channel.send('Veuillez fournir un format valide : `RiotID#Tagline`. Exemple : `!info ZyFod#0801`');
        }


        try {
            // Requête pour obtenir le PUUID
            const accountResponse = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${riotId}/${tagLine}?api_key=${api_key}`);
            const { puuid } = accountResponse.data;

            const summonerResponse = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${api_key}`);
            const { profileIconId, summonerLevel, revisionDate } = summonerResponse.data;

            // Construire l'URL de l'icône de profil
            const profileIconUrl = `http://ddragon.leagueoflegends.com/cdn/14.15.1/img/profileicon/${profileIconId}.png`;

            // Télécharger et analyser l'image pour obtenir la couleur dominante
            const image = await Jimp.read(profileIconUrl);
            const color = image.clone().resize(1, 1).getPixelColor(0, 0); // Obtenir la couleur moyenne
            const hexColor = Jimp.intToRGBA(color); // Convertir en objet RGBA
            const embedColor = `#${((1 << 24) + (hexColor.r << 16) + (hexColor.g << 8) + hexColor.b).toString(16).slice(1)}`; // Convertir en hex

            const revisionDateFormatted = new Date(revisionDate).toLocaleString('fr-FR', { timeZone: 'UTC' });

            const resultEmbed = new EmbedBuilder()
                .setColor(embedColor) // Utiliser la couleur moyenne
                .setTitle(`Profil de ${riotId}#${tagLine}`)
                .setThumbnail(profileIconUrl)
                .addFields(
                    { name: 'Niveau', value: `${summonerLevel}`, inline: false },
                    { name: 'Dernière Connexion', value: `${revisionDateFormatted}`, inline: false } // Ajout du champ pour la date révisée
                );

            // Envoyer l'embed
            message.channel.send({ embeds: [resultEmbed] });

        } catch (error) {
            message.channel.send('Erreur lors de la récupération des données du joueur. Assurez-vous que le Riot ID et la tagline sont corrects.');
        }
    },
};
