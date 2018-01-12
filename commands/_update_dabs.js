module.exports = function update_dabs(member, config, amount) {
    user = config.users[member.id]
    if (user === undefined) {
        user = config.users[member.id] = {
            dabs: 100,
            dab_record: 100,
            level: 1,
            daily_rolls: 0,
            daily_claim: -1,
        }
        message.reply("not found in database, 100 free dabs!")
    }
    if (user.daily_claim != new Date().getDay()) {
        user.daily_claim = new Date().getDay()
        user.daily_rolls += Math.floor(10 * (Math.log(user.level) / Math.log(5))) + 1
        message.channel.send(`${member.username} has new daily rolls!`)
    }
    if (user.dabs > user.dab_record) user.dab_record = user.dabs
    return user
}
