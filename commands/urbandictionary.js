const request = require('request')
const { RichEmbed, Util } = require('discord.js')

function nameLinks (str) {
  str.match(/\[[\w\-' ]+\]/g).map(namedLink => {
    str = str.replace(
      namedLink,
      namedLink + `(https://www.urbandictionary.com/define.php?term=${encodeURIComponent(namedLink.slice(1, -1))})`)
  })
  return str
}

function buildEmbed (definition, index, total) {
  return new RichEmbed({
    author: { name: `Urban Dictionary ${index === 0 ? 'Top result' : `${index}/${total}`}` },
    title: definition.word,
    url: definition.permalink,
    description: [
      Util.escapeMarkdown(nameLinks(definition.definition)),
      '',
      Util.escapeMarkdown(nameLinks(definition.example))
        .split('\r\n')
        .map(line => line === '' ? line : `*${line}*`)
        .join('\n')
    ].join('\n'),
    footer: { text: definition.author },
    timestamp: definition.written_on
  })
}

module.exports = {
  title: 'Urban dictionary',
  desc: [].join('\n'),
  syntax: [].join('\n'),
  alias: ['ud', 'urban', 'dictionary'],
  owner_only: false,
  affect_config: false,
  action: (message) => {
    const query = message.content.split(' ').slice(1).join(' ')
    if (query === '') return message.channel.send('Cannot search blank query.')
    const req = {
      url: `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`
      // headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0' }
    }
    request.get(req, (err, res, body) => {
      if (err) return message.channel.send(`Error:\`\`\`\n${String(err)}\`\`\``)
      const results = JSON.parse(body).list
      let index = 0
		if(results[0] === undefined) { 
			return message.channel.send('Query not found.') 
		} else {
			return message.channel.send('', buildEmbed(results[0], 0, 0)) 
		}

    })
  }
}