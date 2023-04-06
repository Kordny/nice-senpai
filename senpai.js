const Discord = require('discord.js')
const fs = require('fs')
const commands = require('./commands.js')
const responses = require('./responses')
const config = require('./config.json')
const client = new Discord.Client()
const ytlivefetch = require('./ytlivefetch.js')
const ytpostedids = require('./ytids.json');
const tweetpostedids = require('./tweetids.json');
const { TwitterApi } = require('twitter-api-v2');


client.login(config.token)

client.on('ready', function () {
  console.log('hi')
  
  //function to check for new youtube streams using no api
  function fetchIDs() {
  try {	  
	IPOSTED = false;
	filtrvideoIDs = ytlivefetch.fetchVideoIds().then((result) => {
		for (result of filtrvideoIDs) {
			//check if it wasnt posted before
			if(ytpostedids.ids.find(element => element == result) === undefined) {
				client.channels.find(val => val.id === config.streamdiscordchannel).send("https://www.youtube.com/watch?v=" + result);
				ytpostedids.ids.push(result);
				console.log('Posted stream id ' + result)
				IPOSTED = true;
			} else {
				//nothing really to do if it was, unless we come up with something later
			}
		}
		//function to write newly posted streams to file
		if(IPOSTED) {
			fs.writeFile('./ytids.json', JSON.stringify(ytpostedids, null, 4), (err) => {
				if (err) return console.log('Error saving file, progress might be lost.')
				console.log('Saved yt id file.');
			})
		}
	});
  } catch (err) {
    console.error(err);
  }
  }
  fetchIDs();
  //miliseconds because we dont care about readability
  setInterval(fetchIDs , 30000);
  
  //function to delete old streams after a day, if you somehow streamed for longer than that congratulations
  function cleanOldStreams() {
  try {	
	var ts = Math.round(new Date().getTime());
	//discord message timestamp is in miliseconds
	var tsYesterday = ts - (24 * 3600 * 1000);
	for (const xyz of ytpostedids.ids) {  
		client.channels.find(val => val.id === config.streamdiscordchannel).fetchMessages()
		.then(messages => {
			messages.filter(m => m.author.id === config.bot_id && m.content === "https://www.youtube.com/watch?v=" + xyz && m.createdTimestamp <=  tsYesterday).deleteAll(/*console.log("Deleted old post of id " + xyz)*/);
			//fix posting logs on deletion
		})
	}
  } catch (err) {
    console.error(err);
  }
  } cleanOldStreams();
  setInterval(cleanOldStreams , 7200000);
  
  //function to check twitter for new tweets
  async function fetchTweets() {
  try {	
	const userClient = new TwitterApi({
		appKey: config.twitterkey,
		appSecret: config.twittersecret,
	});
	//usign api v1 because we can use the extracted keys for Twitter for iPhone, fuck you Elon
	const userTimeline = await userClient.v1.userTimeline(config.twitterid, { include_entities: true});
	const fetchedTweets = userTimeline.tweets;
	//check only last two days so it doesnt post dozens of tweets on first run, hopefully
	//twitter timestamp is in seconds
	var ts = Math.round(new Date().getTime() / 1000);
	var tsTwoDaysAgo = ts - (48 * 3600);
	fetchedTweetsFiltered = fetchedTweets.filter(x => Math.floor(new Date(x.created_at).getTime() / 1000) >= tsTwoDaysAgo).map(x => x.id_str);
	IPOSTED = false;
	for (tweet of fetchedTweetsFiltered) {
			if(tweetpostedids.ids.find(element => element == tweet) === undefined) {
				//we have the twitterhandle in a config despite it being unnecessary so it looks nicer
				client.channels.find(val => val.id === config.twitterdiscordchannel).send("https://twitter.com/" + config.twitterhandle + "/status/" + tweet);
				tweetpostedids.ids.push(tweet);
				console.log('Posted tweet id ' + tweet)
				IPOSTED = true;
			} else {
			}
	}
	//write posted twitter ids to file
	if(IPOSTED) {
		fs.writeFile('./tweetids.json', JSON.stringify(tweetpostedids, null, 4), (err) => {
			if (err) return console.log('Error saving file, progress might be lost.')
			console.log('Saved tweet id file.');
		})
	}
  } catch (err) {
    console.error(err);
  }} fetchTweets();
  setInterval(fetchTweets , 30000);
})

client.on('message', function (message) {
  if (
    message.author.id === client.user.id ||
        !message.guild ||
        config.ignore.server.indexOf(message.guild.id) >= 0 ||
        config.ignore.channel.indexOf(message.channel.id) >= 0 ||
        config.ignore.user.indexOf(message.author.id) >= 0
  ) return

  let prefix = config.command_prefix
  if (config.server_prefix[message.guild.id]) { prefix = config.server_prefix[message.guild.id] }
  if (message.content.startsWith(prefix)) {
    let input = message.content.split(' ')[0].slice(1).toLowerCase()
    if (message.content.slice(0, 2) === prefix + prefix) input = 'info'
    for (const command of commands) {
      if (command.alias.indexOf(input) >= 0) {
        if (command.owner_only && message.author.id !== config.owner_id) return
        command.action(message, config)
        if (command.affect_config) {
          fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => {
            if (err) return message.channel.send('Error saving file, progress might be lost.')
            console.log('Config saved.')
          })
        }
        return
      }
    }
  } else if (message.author.id !== client.id && !message.author.bot) {
    if (config.responses[message.guild.id]) {
      for (const [response, responseData] of Object.entries(config.responses[message.guild.id])) {
        responses[response].action(message, responseData, config)
        console.log(response, responseData)
        fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => {
          if (err) return message.channel.send('Error saving file, progress might be lost.')
          console.log('Config saved.')
        })
      }
    }
  }
})
