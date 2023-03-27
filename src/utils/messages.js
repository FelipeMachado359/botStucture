const { BOT_EMOJI, BOT_NAME, PREFIX } = require("../config");

function errorMessage(message) {
  return `${BOT_EMOJI} ❌ Erro! ${message}`;
}

function warningMessage(message) {
  return `${BOT_EMOJI} ⚠ Atenção! ${message}`;
}

function menuMessage() {
  const date = new Date();

  return `╭━━⪩ CHICO BOT ⪨━━
▢
▢ • ${BOT_NAME}
▢ • Data: ${date.toLocaleDateString("pt-br")}
▢ • Hora: ${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: ${PREFIX}
▢ • versão: 1.7.0
▢
╰━━─「🦧」─━━
╭━━⪩ MENU ⪨━━
▢
▢ • ${PREFIX}cep
▢ • ${PREFIX}ping
▢ • ${PREFIX}sticker
▢ • ${PREFIX}gpt *aguarde a resposta da IA*
▢
╰━━─「🍌」─━━
╭━━⪩ CONTATO ⪨━━
▢
▢ • instagram - @npcMachado
▢ • wpp - +5511982326003
▢ • email - felipemachado359@gmail.com
▢ • GitHub - FelipeMachado359
▢
╰━━─「🙊」─━━
╭━━⪩ FUTURO ⪨━━
▢
▢ • Comando cadastrar eventos
▢ • Criar enquetes
▢ • integração com RIOT Api
▢ • *incentive meu trabalho:* 
▢ • pix - felipemachado359@gmail.com
▢
╰━━─「🦍」─━━`;
}

module.exports = {
  errorMessage,
  menuMessage,
  warningMessage,
};