const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'timer',
    description: 'Démarre un chronomètre pour une durée donnée.',
    async execute(message, args) {
        // Vérifier que des arguments ont été fournis
        if (args.length < 1) {
            return message.channel.send('Veuillez spécifier une durée. Exemple : `!timer 60s`, `!timer 5m`, `!timer 2h`');
        }

        const durationString = args[0];
        let duration;

        // Extraire la valeur et l'unité de la durée
        const match = durationString.match(/^(\d+)([smh])$/);
        if (!match) {
            return message.channel.send('Durée invalide. Utilisez un format valide : `60s`, `5m`, `2h`.');
        }

        const value = parseInt(match[1]);
        const unit = match[2];

        // Convertir la durée en millisecondes
        switch (unit) {
            case 's': // secondes
                duration = value * 1000;
                break;
            case 'm': // minutes
                duration = value * 60 * 1000;
                break;
            case 'h': // heures
                duration = value * 60 * 60 * 1000;
                break;
            default:
                return message.channel.send('Unité non reconnue. Utilisez `s`, `m` ou `h`.');
        }

        // Envoyer un message pour indiquer que le chronomètre a commencé
        const timestamp = new Date();
        const formattedDate = timestamp.toLocaleDateString();
        const timerEmbed = new EmbedBuilder()
            .setColor('#248046')
            .setTitle('Chronomètre démarré')
            .setDescription(`Le chronomètre est réglé pour **${value}${unit}**.`)
            .setThumbnail('https://media1.tenor.com/m/SBVXsVU2TT0AAAAC/veigar-zhonyas.gif')
            .setFooter({ text: `Date: ${formattedDate}` });

        const sentMessage = await message.channel.send({ embeds: [timerEmbed] });

        // Démarrer le chronomètre
        setTimeout(async () => {
            const endEmbed = new EmbedBuilder()
                .setColor('#248046')
                .setTitle('Le temps est écoulé')
                .setDescription(`${message.author}, votre chronomètre de ${value} ${unit} est terminé !`)
                .setImage('https://media1.tenor.com/m/e_wZIvnFin4AAAAC/thresh-league.gif');

            await sentMessage.edit({ embeds: [endEmbed] });
        }, duration);
    },
};
