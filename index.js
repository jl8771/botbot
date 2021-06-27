const fs = require('fs');
const { TwitterApi } = require("twitter-api-v2");
const { MessageEmbed, Client, MessageAttachment } = require("discord.js")
const fetch = require('node-fetch');
const client = new Client();
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const PREFIX = '!';

require('dotenv').config();

const twitterClient = new TwitterApi(process.env.BEARER_TOKEN);
const roClient = twitterClient.readOnly;

var tweetText;
var tweetId;
var tweetUser;
var NOTIFY_CHANNEL;
var startDate;

client.on('ready', () => {
  startDate = new Date();
  client.user.setActivity("Now Online"); //Sets game playing
  console.log(`Logged in as ${client.user.tag}!`);
  NOTIFY_CHANNEL = client.channels.cache.get('858555302483460176');
  getTweetUser().then(valueRes => tweetUser = valueRes);
  getTweetId().then(valueRes => tweetId = valueRes);
  getTweetText().then(valueRes => tweetText = valueRes);
});

setInterval(function() {
  getTwitterInfo();
  const embedMsg = new MessageEmbed()
      			.setTitle(tweetUser[0] + " (@"+tweetUser[1]+")")
            .setURL("https://twitter.com/"+tweetUser[1])
      			.setColor(0x1DA1F2)
      			.setDescription(tweetText[0])
            .setFooter("Fetched from Twitter by BackslashTBot", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setThumbnail(tweetUser[2])
            .addField('Tweet Created At: ', tweetText[1], true)
            .addField('Attachment Type: ', tweetText[3], true)
            .setImage(tweetText[2])
            .setTimestamp();
          NOTIFY_CHANNEL.send(embedMsg);
}, 3 * 1000);

async function getTweetUser() {
  const twitterUser = await twitterClient.v2.get('users/by/username/Rainbow6Game?user.fields=profile_image_url').catch((err) => console.log(" "));
  await [ twitterUser.data.name, twitterUser.data.username, twitterUser.data.profile_image_url, twitterUser.data.id ];
}

async function getTweetId() {
  const tweets = await twitterClient.v2.get('users/'+tweetUser[3]+'/tweets').catch((err) => console.log(" "));
  //=> console.log(err.message));
  await tweets.data[0].id;
}

async function getTweetText() {
  var displayImageUrl;
  var displayImageType;
  const tweets = await twitterClient.v2.get('tweets?ids='+tweetId+'&expansions=attachments.media_keys&tweet.fields=created_at&media.fields=height,width,url,preview_image_url').catch((err) => console.log(" "));
  switch(tweets.includes.media[0].type) {
    case 'photo':
      displayImageUrl = tweets.includes.media[0].url;
      displayImageType = "Photo"
      break;
    case 'animated_gif':
      displayImageUrl = tweets.includes.media[0].preview_image_url;
      displayImageType = "GIF"
      break;
    case 'video':
      displayImageUrl = tweets.includes.media[0].preview_image_url;
      displayImageType = "Video"
      break;
    default:
      displayImageUrl = '';
      displayImageType = "None"
  }
  var date = new Date(tweets.data[0].created_at);
  var dateStr = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + 
                date.getHours() + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes();
  await [ tweets.data[0].text, dateStr, displayImageUrl, displayImageType ];
}

/*for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}*/


const location = "ottawa";
const tag = "ottawa";
var weathers;
var news;

/*const urls = [
  'http://api.openweathermap.org/data/2.5/weather?q='+location+'&appid=d1118046076544b562399e8deaf8653a',
  'https://newsapi.org/v2/everything?q='+tag+'&from='+date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+'&sortBy=popularity&pageSize=6&apiKey=7a4826f801d84e739cf7292a7e78f597'
];

Promise.all(urls.map(url =>
  fetch(url)
    .then(checkStatus)
    .then(parseJSON)
    .catch(error => console.log('There was a problem!', error))
  ))
  .then(data => {
    weathers = data[0];
})*/

function checkStatus(response) {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

function parseJSON(response) {
  return response.json();
}

function getTwitterInfo(){
  getTweetUser().then(valueRes => tweetUser = valueRes);
  getTweetId().then(valueRes => tweetId = valueRes);
  getTweetText().then(valueRes => tweetText = valueRes);

}

const file = new MessageAttachment('../src/sun.png');

client.on('message', async message => {
  const input = message.content.slice(PREFIX.length).trim().split(' ');
		const command = input.shift();
		const commandArgs = input.join(' ');

		if (command === 'a') {
      message.channel.send("a " + client.channels.cache.findKey());
		} else if (command === 'b') {
			// [epsilon]
		} else if (command === 'c') {
      getTwitterInfo();
      const embed = new MessageEmbed()
      			.setTitle(tweetUser[0] + " (@"+tweetUser[1]+")")
            .setURL("https://twitter.com/"+tweetUser[1])
      			.setColor(0x1DA1F2)
      			.setDescription(tweetText[0])
            .setFooter("Fetched from Twitter by BackslashTBot", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setThumbnail(tweetUser[2])
            .addField('Tweet Created At: ', tweetText[1], true)
            .addField('Attachment Type: ', tweetText[3], true)
            .setImage(tweetText[2])
            .setTimestamp();
      		message.channel.send(embed);
		} else if (command === 'd') {
			getTweetText().then(valueRes => tweetText = valueRes);
      getTweetUser().then(valueRes => tweetUser = valueRes);
			const embed = new MessageEmbed()
      			.setTitle(tweetUser[0] + " (@"+tweetUser[1]+")")
            .setURL("https://twitter.com/"+tweetUser[1])
      			.setColor(0xff0000)
      			.setDescription(tweetText[0])
            .setFooter("Fetched from Twitter by BackslashTBot", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setThumbnail(tweetUser[2])
            .setTimestamp();
      		message.channel.send(embed);
		} else if (command === 'e') {
			const embed = new MessageEmbed()
      			.setTitle("Bot")
      			.setColor(0xff0000)
      			.setDescription("Currently in testing")
            .setFooter("bottom text", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setAuthor("hi big boy ;)",'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg', 'https://www.google.ca')
            .addFields(
              { name: 'Temperature', value: (weathers.main.temp - 273).toFixed(1) + " C", inline: true },
              { name: 'Humidity', value: weathers.main.humidity + "%", inline: true },
              { name: 'Weather', value: weathers.weather[0].description, inline: true },
            )
            .setImage('https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setThumbnail('https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setTimestamp();
      		message.channel.send(embed);
		} else if (command === 'f') {
      getTweetText().then(valueRes => tweetText = valueRes);
      getTweetUser().then(valueRes => tweetUser = valueRes);
			const embed = new MessageEmbed()
      			.setTitle("Bot")
      			.setColor(0xff0000)
      			.setDescription("Currently in testing :)")
            .setFooter("bottom text", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setAuthor("big boy",'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg', 'https://www.google.ca')
            .addFields(
              { name: tweetUser[0], value: tweetText[0] },
              { name: '\u200B', value: '\u200B' }, //newline
              { name: 'Temperature', value: (weathers.main.temp - 273).toFixed(1) + " C", inline: true },
              { name: 'Humidity', value: weathers.main.humidity + "%", inline: true },
              { name: 'Weather', value: weathers.weather[0].description, inline: true },
            )
            .setImage('https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setThumbnail('https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setTimestamp();
      		message.channel.send(embed);
		}
});

client.login(process.env.TOKEN);