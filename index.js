const fs = require('fs');
const ytdl = require('ytdl-core');
const { TwitterApi } = require("twitter-api-v2");
const { MessageEmbed, Client, MessageAttachment } = require("discord.js")
const fetch = require('node-fetch');
const client = new Client();
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const PREFIX = '!';

require('dotenv').config();

const twitterClient = new TwitterApi(process.env.BEARER_TOKEN);
const roClient = twitterClient.readOnly;

var NOTIFY_CHANNEL;
var TEST_CHANNEL;
var TEST_VC;
var startDate = new Date();

client.on('ready', () => {
  client.user.setActivity("Now Online"); //Sets game playing
  console.log(`Logged in as ${client.user.tag}! at ` + startDate.getHours() + ":" + (startDate.getMinutes()<10?'0':'') + startDate.getMinutes());
  NOTIFY_CHANNEL = client.channels.cache.get('858555302483460176');
  TEST_CHANNEL = client.channels.cache.get('858546770199969792');
  TEST_VC = client.channels.cache.get('858065557248278541');
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testClock() {
  let fixDate = new Date();
  var bongTimes;
  await sleep((60 - fixDate.getSeconds())* 1000);
  while (true) {
    let currDate = new Date();
    if (currDate.getMinutes() == 0) {
      currDate.getHours()>12?bongTimes=currDate.getHours()-12:bongTimes=currDate.getHours();
      const connection = await TEST_VC.join();
      const dispatcher = connection.play(fs.createReadStream('./audio/output1.ogg'), {
        type: 'ogg/opus',
      });
      dispatcher.on('finish', () => {
        connection.disconnect();
      });
    }
    await sleep(60 * 1000);
  }
}

var lastTweetId = '0';
setInterval(function() {
  getTweetInfo('LCSOfficial').then(value => {
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
}, 120 * 1000);

async function getTweetInfo(username) {
  var displayImageUrl;
  var displayImageType;
  
  const twitterUser = await twitterClient.v2.get('users/by/username/'+username+'?user.fields=profile_image_url').catch((err) => console.log(" "));
  const tweetStream = await twitterClient.v2.get('users/'+twitterUser.data.id+'/tweets').catch((err) => console.log(" "));
  const tweets = await twitterClient.v2.get('tweets?ids='+tweetStream.data[0].id+'&expansions=attachments.media_keys' + 
                                                                                  '&tweet.fields=created_at,public_metrics' + 
                                                                                  '&media.fields=height,width,url,preview_image_url').catch((err) => console.log(" "));
  
  if ('attachments' in tweets.data[0] || 'includes' in tweets) {
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
  }else {
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

var location = "ottawa";
//const tag = "ottawa";
var weather;
//var news;

//'https://newsapi.org/v2/everything?q='+tag+'&from='+startDate.getFullYear()+'-'+startDate.getMonth()+'-'+startDate.getDate()+'&sortBy=popularity&pageSize=6&apiKey=7a4826f801d84e739cf7292a7e78f597'

client.on('message', async message => {
  const input = message.content.slice(PREFIX.length).trim().split(' ');
		const command = input.shift().toLowerCase();
		const commandArgs = input.join('-');

		if (command === 'a') {
      if (!message.guild) return;
        // Only try to join the sender's voice channel if they are in one themselves
        if (message.member.voice.channel) {
          const connection = await message.member.voice.channel.join();
          connection.play(fs.createReadStream('./audio/output1.ogg'), {
            type: 'ogg/opus',
          });
        } else {
          message.reply('You need to join a voice channel first!');
        }
		} else if (command === 'bong') {
      testClock();
      message.reply("Bonging now enabled! Next bong in " + (60 - startDate.getMinutes()) + " minutes!");
		} else if (command === 'uwu') {
      if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=qZHsR2-pPEo', { filter: 'audioonly' }));
        dispatcher.on('finish', () => {
          connection.disconnect();
        });
      } else {
        message.reply('You need to join a voice channel first!');
      }
		} else if (command === 'gl') {
      if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=aB2yqeD0Nus', { filter: 'audioonly' }));
        dispatcher.on('finish', () => {
          connection.disconnect();
        });
      } else {
        message.reply('You need to join a voice channel first!');
      }
		} else if (command === 'play') {
      if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(ytdl(commandArgs, { filter: 'audioonly' }));
        dispatcher.on('finish', () => {
          connection.disconnect();
        });
      } else {
        message.reply('You need to join a voice channel first!');
      }
      message.reply("Now playing - " + commandArgs);
		} else if (command === 'c') {
      const connection = await TEST_VC.join();
      const dispatcher = connection.play(fs.createReadStream('./audio/output1.ogg'), {
        type: 'ogg/opus',
      });
      dispatcher.on('finish', () => {
        connection.disconnect();
      });
		} else if (command === 'e') {
			 
		} else if (command === 'weather') {
      location = commandArgs;
      var displayIcon;
			fetch('http://api.openweathermap.org/data/2.5/weather?q='+location+'&appid=d1118046076544b562399e8deaf8653a')
        .then(res => res.json())
        .then(json => {
          switch(json.weather[0].id) {
            case 200: case 201: case 202: case 210: case 211: case 212: case 221: case 230: case 231: case 232:
                displayIcon = '/thunderstorm.png';
                iconAlt = 'Thunderstorm';
                break;
            case 300: case 301: case 302: case 310: case 311: case 312: case 313: case 314: case 321:
                displayIcon = '/shower.png';
                iconAlt = "Drizzle"
                break;
            case 500: case 501: 
                displayIcon = '/rain.png';
                iconAlt = 'Rain';
                break;
            case 502: case 503: case 504:
                displayIcon = '/rain.png';
                iconAlt = 'Heavy Rain';
                break;
            case 511:
                displayIcon = '/snow.png';
                iconAlt = 'Freezing Rain';
                break;
            case 520: case 521: case 522: case 531:
                displayIcon = '/shower.png';
                iconAlt = 'Shower Rain';
                break;
            case 600: case 601: case 612: case 613: case 615: case 616: case 620: case 621:
                displayIcon = '/snow.png';
                iconAlt = 'Snow';
                break;
            case 602: case 611: case 622:
                displayIcon = '/snow.png';
                iconAlt = 'Heavy Snow';
                break;
            case 701: case 711: case 721: case 731: case 741: case 751: case 761: case 771:
                displayIcon = '/mist.png';
                iconAlt = 'Atmospheric';
                break;
            case 762:
                displayIcon = '/mist.png';
                iconAlt = 'Volcanic Ash';
                break;
            case 781:
                displayIcon = '/mist.png';
                iconAlt = 'Tornado';
                break;
            case 800:
                displayIcon = '/sun.png';
                iconAlt = 'Clear Sky';
                break;
            case 801:
                displayIcon = '/few.png';
                iconAlt = 'Few Clouds';
                break;
            case 802:
                displayIcon = '/scattered.png';
                iconAlt = 'Scattered Clouds';
                break;
            case 803:
                displayIcon = '/broken.png';
                iconAlt = 'Broken Clouds';
                break;
            case 804:
                displayIcon = '/broken.png';
                iconAlt = 'Overcast';
                break;
            default:
                displayIcon = '/sun.png';
                iconAlt = 'Undefined';
          }
          const embed = new MessageEmbed()
            .setTitle("Current Weather in " + location.charAt(0).toUpperCase() + location.slice(1) + ", " + json.sys.country)
            .setColor(0x008000)
            .setFooter("Fetched from OpenWeatherMap by BackslashTBot", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .addFields(
              { name: 'Temperature', value: (json.main.temp - 273).toFixed(1) + " \u00b0" + "C", inline: true },
              { name: 'Humidity', value: json.main.humidity + "%", inline: true },
              { name: 'Weather', value: iconAlt, inline: true },
            )
            .addFields(
              { name: 'Pressure', value: json.main.pressure + " hPa", inline: true },
              { name: 'Wind', value: json.wind.deg + "\u00b0" + " At " + (json.wind.speed * 3.6).toFixed(1) + " km/h", inline: true },
            )
            .attachFiles(['./src' + displayIcon])
            .setThumbnail('attachment:/' + displayIcon)
            .setTimestamp();
      	  message.channel.send(embed);
          return json;
        });     
		} else if (command === 'f') {
      location = commandArgs;
      weather = getWeatherInfo(location);
      //console.log(weather);
			const embed = new MessageEmbed()
      			.setTitle("Bot")
      			.setColor(0xff0000)
      			.setDescription("Currently in testing :)")
            .setFooter("Fetched from OpenWeatherMap by BackslashTBot", 'https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .addFields(
              { name: 'Temperature', value: (weather.main.temp - 273).toFixed(1) + " \u00b0" + "C", inline: true },
              { name: 'Humidity', value: weather.main.humidity + "%", inline: true },
              { name: 'Weather', value: weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1), inline: true },
            )
            .setImage('https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setThumbnail('https://images-cdn.9gag.com/photo/aMj33oX_700b.jpg')
            .setTimestamp();
      		message.channel.send(embed);
		}
});

client.login(process.env.TOKEN);