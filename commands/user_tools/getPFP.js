const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

module.exports = {
    name: 'pfps',
    description: 'Télécharge les photos de profil des utilisateurs mentionnés dans un fichier ZIP.',
    async execute(message, args) {
        const users = message.mentions.users;

        if (users.size === 0) {
            return message.channel.send('Veuillez mentionner au moins un utilisateur.');
        }

        const tempFolder = './temp';
        const zipFilePath = path.join(tempFolder, 'profile_pics.zip');

        // Créer un dossier temporaire
        if (!fs.existsSync(tempFolder)) {
            fs.mkdirSync(tempFolder);
        }

        // Télécharger les photos de profil et les enregistrer
        for (const [_, user] of users) {
            const avatarURL = user.displayAvatarURL({ format: 'png', size: 1024 });
            const filePath = path.join(tempFolder, `${user.username}.png`);

            const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
            fs.writeFileSync(filePath, response.data);
        }

        // Créer un fichier ZIP
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);

        for (const [_, user] of users) {
            const filePath = path.join(tempFolder, `${user.username}.png`);
            archive.file(filePath, { name: `${user.username}.png` });
        }

        await archive.finalize();

        output.on('close', async () => {
            const zipAttachment = new AttachmentBuilder(zipFilePath);
            await message.channel.send({ content: 'Voici les photos de profil demandées :', files: [zipAttachment] });

            // Supprimer les fichiers temporaires
            fs.rmSync(tempFolder, { recursive: true, force: true });
        });
    },
};
