const { BOT_EMOJI, TEMP_FOLDER } = require("../config");
const { consultarCep } = require("correios-brasil");
const {
  extractDataFromMessage,
  downloadImage,
  downloadVideo,
  downloadSticker,
  isCommand,
} = require("../utils");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const { unlink } = require('fs')
const { errorMessage, warningMessage } = require("../utils/messages.js");
const { Configuration, OpenAIApi } = require('openai')
const P = require('pino');
const { start } = require("repl");


class Action {
  constructor(bot, baileysMessage) {
    const { remoteJid, args, isImage, isVideo, isSticker } =
      extractDataFromMessage(baileysMessage);

    this.bot = bot;
    this.remoteJid = remoteJid;
    this.args = args;
    this.isImage = isImage;
    this.isVideo = isVideo;
    this.isSticker = isSticker;
    this.baileysMessage = baileysMessage;
  }

  //Chat GPT (Imagem)
  async gptImg() {
    const configuration = new Configuration({
      organization: 'org-VTi9z53y6py9zJl7uCb7mKd1',
      apiKey: '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',
    });
    
    const openai = new OpenAIApi(configuration);

    const getDalleResponse = async (clientText) => {
      const options = {
          prompt: clientText, // Descrição da imagem
          n: 1, // Número de imagens a serem geradas
          size: "1024x1024", // Tamanho da imagem
      }
  
      try {
          const response = await openai.createImage(options);
          console.log(response.data.data[0].url);
          return response.data.data[0].url
      } catch (e) {
          return `❌ OpenAI Response Error: ${e.response.data.error.message}`
      }
  }

  const msgChatGpt = this.baileysMessage.message.conversation;

  //imagem (quebrado)
  if (msgChatGpt.includes('!gptImg ')) {
    const index = msgChatGpt.indexOf(" ");
    const imgDescription = msgChatGpt.substring(index + 1);
    getDalleResponse(imgDescription, msgChatGpt).then((imgUrl) => {
      const GptImagem = {
        caption: imgDescription,
        image : {
          url: imgUrl,
        }
      }
      console.log(imgUrl)
       this.bot.sendMessage(this.remoteJid, GptImagem)
        .then(result => console.log('RESULT: ', result ))
        .catch(err => console.log('ERROR: ', err))
    })

}

  }

  //Chat GPT
  async gptText() {
    const configuration = new Configuration({
      organization: 'org-VTi9z53y6py9zJl7uCb7mKd1',
      apiKey: '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',
    });
    
    const openai = new OpenAIApi(configuration);


  const getDavinciResponse = async (clientText) => {
      const options = {
          model: "text-davinci-003", // Modelo GPT a ser usado
          prompt: clientText, // Texto enviado pelo usuário
          temperature: 1, // Nível de variação das respostas geradas, 1 é o máximo
          max_tokens: 4000 // Quantidade de tokens (palavras) a serem retornadas pelo bot, 4000 é o máximo
      }
  
      try {
          const response = await openai.createCompletion(options)
          let botResponse = ""
          response.data.choices.forEach(({ text }) => {
              botResponse += text
          })
          return `Chat GPT 🤖\n\n ${botResponse.trim()}`
      } catch (e) {
          return `❌ OpenAI Response Error: ${e.response.data.error.message}`
      }
  }
  
  const getDalleResponse = async (clientText) => {
      const options = {
          prompt: clientText, // Descrição da imagem
          n: 1, // Número de imagens a serem geradas
          size: "1024x1024", // Tamanho da imagem
      }
  
      try {
          const response = await openai.createImage(options);
          console.log(response.data.data[0].url);
          return response.data.data[0].url
      } catch (e) {
          return `❌ OpenAI Response Error: ${e.response.data.error.message}`
      }
  }

  const msgChatGpt = this.baileysMessage.message.conversation;

    //texto
     if (msgChatGpt.includes('!gpt '))  {
        const index = msgChatGpt.indexOf(" ");
        const question = msgChatGpt.substring(index + 1);
        getDavinciResponse(question).then((response) => {
           this.bot.sendMessage(this.remoteJid, {
            text: response })
          .then(result => console.log('RESULT: ', result ))
          .catch(err => console.log('ERROR: ', err))
        })

      }
  
}

  //Busca de CEP
  async cep() {
    if (!this.args || ![8, 9].includes(this.args.length)) {
      await this.bot.sendMessage(this.remoteJid, {
        text: errorMessage(
          "Você precisa enviar um CEP no formato xxxxx-xxx ou xxxxxxxx!"
        ),
      });
      return;
    }

    try {
      const { data } = await consultarCep(this.args);

      if (!data.cep) {
        await this.bot.sendMessage(this.remoteJid, {
          text: warningMessage("CEP não encontrado!"),
        });
        return;
      }

      await this.bot.sendMessage(this.remoteJid, {
        text: `${BOT_EMOJI} *Resultado*
        
*CEP*: ${data.cep}
*Logradouro*: ${data.logradouro}
*Complemento*: ${data.complemento}
*Bairro*: ${data.bairro}
*Localidade*: ${data.localidade}
*UF*: ${data.uf}
*IBGE*: ${data.ibge}`,
      });
    } catch (error) {
      console.log(error);
      await this.bot.sendMessage(this.remoteJid, {
        text: errorMessage(`Contate o proprietário do bot para resolver o problema!
        
Erro: ${error.message}`),
      });
    }
  }

  // Cria Figurinha
  async sticker() {
    if (!this.isImage && !this.isVideo) {
      await this.bot.sendMessage(this.remoteJid, {
        text: errorMessage("Pfv, mande uma imagem ou um vídeo!"),
      });
      return;
    }

    const outputPath = path.resolve(TEMP_FOLDER, "output.webp");

    if (this.isImage) {
      const inputPath = await downloadImage(this.baileysMessage, "input");

      exec(
        `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`,
        async (error) => {
          if (error) {
            console.log(error);

            fs.unlinkSync(inputPath);

            await this.bot.sendMessage(this.remoteJid, {
              text: errorMessage("Não foi possível converter a figurinha!"),
            });

            return;
          }

          await this.bot.sendMessage(this.remoteJid, {
            sticker: { url: outputPath },
          });

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        }
      );
    } else {
      const inputPath = await downloadVideo(this.baileysMessage, "input");

      const sizeInSeconds = 10;

      const seconds =
        this.baileysMessage.message?.videoMessage?.seconds ||
        this.baileysMessage.message?.extendedTextMessage?.contextInfo
          ?.quotedMessage?.videoMessage?.seconds;

      const haveSecondsRule = seconds <= sizeInSeconds;

      if (!haveSecondsRule) {
        fs.unlinkSync(inputPath);

        await this.bot.sendMessage(this.remoteJid, {
          text: errorMessage(`O vídeo que você enviou tem mais de ${sizeInSeconds} segundos!
Envie um vídeo menor!`),
        });

        return;
      }

      exec(
        `ffmpeg -i ${inputPath} -y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -f webp ${outputPath}`,
        async (error) => {
          if (error) {
            fs.unlinkSync(inputPath);

            await this.bot.sendMessage(this.remoteJid, {
              text: errorMessage(
                "Não foi possível converter o vídeo/gif em figurinha!"
              ),
            });

            return;
          }

          await this.bot.sendMessage(this.remoteJid, {
            sticker: { url: outputPath },
          });

          fs.unlinkSync(inputPath);
          fs.unlinkSync(outputPath);
        }
      );
    }
  }

  async toImage() {
    if (!this.isSticker) {
      await this.bot.sendMessage(this.remoteJid, {
        text: errorMessage("Você precisa enviar um sticker!"),
      });
      return;
    }

    const inputPath = await downloadSticker(this.baileysMessage, "input");
    const outputPath = path.resolve(TEMP_FOLDER, "output.png");

    exec(`ffmpeg -i ${inputPath} ${outputPath}`, async (error) => {
      if (error) {
        console.log(error);
        await this.bot.sendMessage(this.remoteJid, {
          text: errorMessage(
            "Não foi possível converter o sticker para figurinha!"
          ),
        });
        return;
      }

      await this.bot.sendMessage(this.remoteJid, {
        image: { url: outputPath },
      });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  }
}

module.exports = Action;