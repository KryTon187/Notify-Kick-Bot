const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})
//const gzip = require('pako');


const prefix = '!';

const onlineKickUser = [];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

//

async function test() {
  const response = await fetch("https://kick.com/api/v1/channels/classybeef");
  const data = await response.json();
  if(data.livestream != null) {
      console.log(data.livestream)    
  }
}
test()

//
 function printOnline(streamerName = "", message) {
  console.log("read data for" + streamerName);
  console.log(`https://kick.com/api/v1/channels/${streamerName}`);
  getData(`https://kick.com/api/v1/channels/${streamerName}`).then((data) => {
   
    if (data != null) {
      console.log("data.livestream" + data.livestream);
      if (data.livestream == null) {
        const index = onlineKickUser.indexOf(streamerName);
        if (index > -1) { // only splice array when item is found
          array.splice(index, 1); // 2nd parameter means remove one item only
        }
      } else {
        if (!onlineKickUser.includes(streamerName)) {
          printEmbed(data, message, streamerName);
          onlineKickUser.push(streamerName);
        }
      }
    }
  });
}
 function printEmbed(data, message, streamerName) {
  console.log("data.livestream.language" + data.livestream.language);
  console.log("data.livestream.categories.name" + data.livestream.categories.name);
  console.log("data.livestream.thumbnail.url" + data.livestream.thumbnail.url);
  const embed = new MessageEmbed()
    .setDescription('```' + data.livestream.session_title + "```")
    .setTitle('**' + streamerName + ' IST LIVE**')
    .addFields(
      { name: 'Language', value: '```' + data.livestream.language + '```', inline: true },
      { name: 'Category', value: '```' + data.livestream.categories[0].category.name + '```', inline: true },
    )
    //.setImage('https://pbs.twimg.com/profile_images/1592334267505201152/ForqNFZm_400x400.jpg')
    .setImage(data.livestream.thumbnail.url)
    .setFooter({ text: 'techzalerts.io' })
    .setTimestamp()
    .setColor('BLUE');

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setLabel('Zum Stream')
        .setStyle('LINK')
        .setURL('https://www.kick.com/' + streamerName)
    );

  message.channel.send({ embeds: [embed], components: [row] });
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  var interval;


  if (command === 'start') {
    if (!interval) {
      let streamerCount = data[message.guild.id]?.kickUsers.length;
      interval = setInterval(async () => {
        const kickUsers = data[message.guild.id]?.kickUsers;
        if (!kickUsers) return;
        for (let i = 1; i <= kickUsers.length; i++) {
          const kickuser = kickUsers[i - 1];
          setTimeout(() => {
            printOnline(kickuser, message);
          }, i * 9000);
        }
      }, streamerCount * 10000);
    } else {
      message.channel.send('its already started');
    }
  }

  if (command === 'stop') {
    clearInterval(interval);
    interval = undefined;
  }

  if (command === 'help') {
    const embed = new MessageEmbed()
      .setTitle('Help Command')
      .setDescription('List of available commands:')
      .addFields({ name: `${prefix}setchannel <#channel>`, value: 'Sets the announcement channel for when the streamer goes live' },
        { name: `${prefix}addkickuser <channel>`, value: 'Adds the Kick.com username for the streamer to monitor' },
        { name: `${prefix}removekickuser <username>`, value: 'Remove the Kick.com username for the streamer to monitor' },
        { name: `${prefix}listkickusers`, value: 'Lists all the Kick.com usernames currently being monitored' },
        { name: `${prefix}testembed`, value: 'Sends an test announcement to the setted announce channel  ' });

    message.channel.send({ embeds: [embed] });
  }

  if (command === 'setchannel') {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Please mention a channel to set as the Announce Channel.');
    }

    data[message.guild.id] = {
      ...data[message.guild.id],
      announceChannelId: channel.id,
    };

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    return message.reply(`The Announce Channel has been set to ${channel}`);
  }
  if (command === 'addkickuser') {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    const username = args[0];
    if (!username) {
      return message.reply('Please provide a Kick.com username.');
    }

    data[message.guild.id] = {
      ...data[message.guild.id],
      kickUsers: [
        ...(data[message.guild.id]?.kickUsers || []),
        username,
      ],
    };

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    return message.reply(`The Kick User ${username} has been added to the list.`);
  }

  if (command === 'removekickuser') {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    const username = args[0];
    if (!username) {
      return message.reply('Please provide a Kick.com username.');
    }

    data[message.guild.id] = {
      ...data[message.guild.id],
      kickUsers: (data[message.guild.id]?.kickUsers || []).filter((u) => u !== username),
    };

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    return message.reply(`The Kick User ${username} has been removed from the list.`);
  }

  if (command === 'listkickusers') {
    const kickUsers = data[message.guild.id]?.kickUsers;
    if (!kickUsers || kickUsers.length === 0) {
      return message.reply('There are no Kick.com usernames currently being monitored.');
    }

    return message.reply(`The following Kick Users are currently being monitored:\n${kickUsers.join(', ')}`);
  }


});

client.login('');