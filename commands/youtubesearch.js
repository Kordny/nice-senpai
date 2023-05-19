const request = require('request')

module.exports = {
  title: 'YouTube Search',
  desc: [
    'Search YouTube for an video, will be the top 20 results sorted by relevance.',
    'Or use yt2 to search for an a random video in the top 5 results.',
    'Any of the aliases ending with 2 is valid for a random search.',
    'Bot will stop listening for reactions after 30 seconds.'
  ].join('\n'),
  syntax: [
    '`{prefix}yt <video query>` where query is what you want to search for.',
    '`{prefix}yt2 <video query>` same as above but will return a random result from top 5.'
  ].join('\n'),
  alias: ['yt', 'youtube', 'yt2', 'youtube2'],
  owner_only: false,
  affect_config: false,
  action: function (message) {
    var query = message.content.split(' ').slice(1).join(' ')
    if (query === '') return message.channel.send('Cannot search blank query.')
    var req = {
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      // headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0' }
    }
    request.get(req, (err, res, body) => {
      if (err) return message.channel.send(`Error:\`\`\`\n${String(err)}\`\`\``)
      var videos = body.match(/(\/watch\?v=[^"]*)(?![\s\S]*\1)/g).map(i => 'https://www.youtube.com/' + i.slice(1))
      var results = videos.length
      var index = 0

        index = Math.floor(Math.random() * Math.floor(results / 5))
        return message.channel.send(`${query}: ${index} / ${results}\n${videos[index]}`)

    })
  }
}