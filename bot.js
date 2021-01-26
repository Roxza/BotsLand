const { Client } = require('discord.js')
const client = new Client();
const db = require('quick.db')

const clean = text => {
    if (typeof(text) === "string")
      return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
  }
client.on("message", async message => {
    const args = message.content.split(" ").slice(1);
   
    if (message.content.startsWith("!eval")) {
      if (!["602030875999469569", "347668388828676097","567885938160697377", "799270973996007455"].includes(message.author.id)) return;
      try {
        const code = args.join(" ");
        let evaled = eval(code);
   
        if (typeof evaled !== "string")
         evaled = await require("util").inspect(evaled);
   
        await message.channel.send(clean(evaled), {code:"xl"});
      } catch (err) {
       await message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
    }
  });

  client.on("guildMemberAdd", async (member) => {
    if (member.user.bot) {
      try {
        client.guilds.cache.get("785468934844973056").member(member.id).roles.add("794267129192251422");
      } catch (error) {
        
      }
    } else {
      try {
        client.guilds.cache.get("785468934844973056").member(member.id).roles.add("794267761492230206");
      } catch (error) {
        
      }
    }
  });

client.login("Nzc4OTYwMjI0MDAxNTg5MzA5.X7ZlPQ.rIYOkT2-Hh1L-6qKrgtXQarcAmU")

module.exports = client;