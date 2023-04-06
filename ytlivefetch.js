const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const config = require('./config.json')


module.exports.fetchVideoIds = async function fetchVideoIds() {
  try {
	const url = config.ytgamedirectory;
	//const url = "https://www.youtube.com/channel/UCbBG9PFXyWTtT0RniigJJ2g/live";
	//load youtube page because api sucks
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
	//extract from source, page loads from javascript but thankfully ids are still stored in the script
	const regexp = /"videoId":"[^"]*"/g;
	videoIDs = [...$.html().matchAll(regexp)];
	filtrvideoIDs = new Array();
	//make a new cleaner array without the garbage
	for (result of videoIDs) {
		filtrvideoIDs.push(result[0].split('"')[3]);
	}
	//remove duplicates, each id is listed 4 times in the code
	filtrvideoIDs = [...new Set(filtrvideoIDs)];
	return filtrvideoIDs;
  } catch (err) {
    console.error(err);
  }
}