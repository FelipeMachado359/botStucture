 //coletor de mensagens
  const handleCollector = async (bot ,remoteJid) => {
    const filter = (m) => m.from === remoteJid.from
    const collector = bot.createMessageCollector(remoteJid.from, filter,{
      max:5,
      time:1000 * 60, //1 min
    })
    await this.bot.sendMessage(this.remoteJid.from, {
      text: "Digite algo para eu coletar" })
    await collector.on('collect', (collectedMessage) => {
      if (collectedMessage) {
        console.log(collectedMessage.content)
      }
    })
    await collector.on('end', async (allCollectedMessages) => {
      if (allCollectedMessages.size === 0) {
        await this.bot.sendMessage(this.remoteJid.from,
           'Nenhuma mensagem coletada' )
        return
      }
      await this.bot.sendMessage(this.remoteJid.from, {
        text: `Mensagens coletadas: ${allCollectedMessages.map((eachMessage) => {
          return `\n ${eachMessage.content}`
        })}` 
      })
    })
  }

  module.exports = handleCollector