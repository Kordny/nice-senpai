const axios = require("axios");
const cheerio = require("cheerio");
const config = require('./config.json')

//"ScCoreLink-sc-16kq0mq-0 WaQo tw-link"

module.exports.fetchTwitchIds = async function fetchTwitchIds() {
  try {
	//const url = "https://m.twitch.tv/directory/game/Bombergirl";
	const url = config.twitchgamedirectory;
	//const url = "https://www.youtube.com/channel/UCbBG9PFXyWTtT0RniigJJ2g/live";
	//load youtube page because api sucks
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

	const divsWithClass = $('a.ScCoreLink-sc-16kq0mq-0.iZohbY.tw-link');

	var foundStreams = [];
	divsWithClass.each((i, a) => {
		foundStreams.push($(a).attr('href'));
	});
	return foundStreams;
  } catch (err) {
    console.error(err);
  }
} 