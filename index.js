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
var startDate = new Date();

client.on('ready', () => {
  client.user.setActivity("Now Online"); //Sets game playing
  console.log(`Logged in as ${client.user.tag}! at ` + startDate.getHours() + ":" + (startDate.getMinutes()<10?'0':'') + startDate.getMinutes());
  NOTIFY_CHANNEL = client.channels.cache.get('858555302483460176');
});

var lastTweetId = '0';
setInterval(function() {
  let result = getTweetInfo('Rainbow6Game').then(value => {
    if (value[4] === lastTweetId) {
      console.log("Already tweeted " + lastTweetId);
    }else {
      const embedMsg = new MessageEmbed()
        .setTitle(value[0] + " (@" + value[1]+")")
        .setURL("https://twitter.com/" + value[1])
      	.setColor(0x1DA1F2)
      	.setDescription(value[5])
        .setFooter("Fetched from Twitter by BackslashTBot", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
        .setThumbnail(value[2])
        /*.addFields(
          { name: ":speech_left:", value: value[9].reply_count, inline: true },
          { name: ":arrows_counterclockwise:", value: value[9].retweet_count, inline: true },
          { name: ":heart:", value: value[9].like_count, inline: true },
        )*/
        .addFields(
          { name: 'Tweet Created At: ', value: value[6], inline: true },
          { name: 'Attachment Type: ', value: value[7], inline: true },
        )
        .setImage(value[8])
        .setTimestamp();
      NOTIFY_CHANNEL.send(embedMsg);
      lastTweetId = value[4];
    }
    return value;
  });
}, 5 * 1000);

async function getTweetInfo(username) {
  var displayImageUrl;
  var displayImageType;
  
  const twitterUser = await twitterClient.v2.get('users/by/username/'+username+'?user.fields=profile_image_url').catch((err) => console.log(" "));
  const tweetStream = await twitterClient.v2.get('users/'+twitterUser.data.id+'/tweets').catch((err) => console.log(" "));
  const tweets = await twitterClient.v2.get('tweets?ids='+tweetStream.data[0].id+'&expansions=attachments.media_keys' + 
                                                                                  '&tweet.fields=created_at,public_metrics' + 
                                                                                  '&media.fields=height,width,url,preview_image_url').catch((err) => console.log(" "));
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
  return await [ twitterUser.data.name, //0
      twitterUser.data.username, //1
      twitterUser.data.profile_image_url, //2
      twitterUser.data.id, //3
      tweetStream.data[0].id, //4
      tweets.data[0].text, //5
      dateStr, //6
      displayImageType, //7
      displayImageUrl, //8
      tweets.data[0].public_metrics //9
  ];
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

const urls = [
  'http://api.openweathermap.org/data/2.5/weather?q='+location+'&appid=d1118046076544b562399e8deaf8653a',
  'https://newsapi.org/v2/everything?q='+tag+'&from='+startDate.getFullYear()+'-'+startDate.getMonth()+'-'+startDate.getDate()+'&sortBy=popularity&pageSize=6&apiKey=7a4826f801d84e739cf7292a7e78f597'
];

Promise.all(urls.map(url =>
  fetch(url)
    .then(checkStatus)
    .then(parseJSON)
    .catch(error => console.log('There was a problem!', error))
  ))
  .then(data => {
    weathers = data[0];
})

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

async function getTwitterInfo(){
  getTweetUser().then(valueRes => {
    tweetUser = valueRes
  }, reason => {
    console.error(reason);
  });
  getTweetId().then(valueRes => {
    tweetId = valueRes
  }, reason => {
    console.error(reason);
  });
  getTweetText().then(valueRes => {
    tweetText = valueRes
  }, reason => {
    console.error(reason);
  });  

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
      
		} else if (command === 'd') {
			
		} else if (command === 'e') {
			
		} else if (command === 'f') {
			const embed = new MessageEmbed()
      			.setTitle("Bot")
      			.setColor(0xff0000)
      			.setDescription("Currently in testing :)")
            .setFooter("bottom text", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setAuthor("big boy",'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg', 'https://www.google.ca')
            .addFields(
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