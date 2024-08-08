const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
const prefix = '!';


const getAllFiles = (dir, files) => {
    files = files || [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, files);
        } else if (fullPath.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
};

const commandFiles = getAllFiles(path.join(__dirname, 'commands'));

for (const file of commandFiles) {
    const command = require(file);
    if (command.name) {
        client.commands.set(command.name, command);
    }
}

client.once('ready', () => {
    console.log('Bot is ready!');
    client.user.setActivity('League of Legends Stacking on the midlane !', { type: ActivityType.Playing });
});

client.on('messageCreate', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) {
        message.reply(`The command \`${commandName}\` does not exist.`);
        return;
    };

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing this command!');
    }
});

client.login(process.env.TOKEN);
