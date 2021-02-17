const dotenv = require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const mongoose = require('mongoose');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB database connection established');
})

// Initialize Discord Bot
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
};

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("$help");
});

client.on('message', message => {
    const prefix = process.env.PREFIX;
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ (.+)/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('That command can\'t be used in DMs.');
    }

    if (command.args && args.length === 0) {
        return message.reply(`The ${commandName} command requires arguments`);
    }

    if (command.permissions) {
        if (!message.member.hasPermission(command.permissions)) {
            return message.reply(`You need the following permissions to use this command: ${JSON.stringify(command.permissions)}`);
        }
    }

    if (command.ownerOnly && message.author.id !== process.env.ADMIN_ID) {
        return message.reply('only the bot owner can use this command');
    }

    try {
        command.execute(message, args[0]);
    } catch (err) {
        console.error(err);
        message.reply('We ran into an error trying to exceute that command')
    }
});

client.login(process.env.DISCORD_TOKEN);