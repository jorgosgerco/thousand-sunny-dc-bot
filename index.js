const { Client, GatewayIntentBits } = require("discord.js");
const { createBountyPoster } = require("./welcome.js");
const { getBerries, addBerries, setBerries } = require("./bounty.js");
const welcomeMessages = require("./welcome_messages.js");
const keepAlive = require("./keep_alive.js");
const { exec } = require("child_process");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

keepAlive();

const ALLOWED_CHANNEL_ID = "1195434323709538435";
const ALLOWED_USER_ID = "1088052955896356925";

client.on("guildMemberAdd", async (member) => {
  const newBerries = await getBerries(member.user.id);
  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  const randomMessage = welcomeMessages[randomIndex].replace(
    /@nickname/g,
    `<@${member.id}>`
  );

  await createBountyPoster(member, newBerries, randomMessage);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // === START of !exec command ===
  if (message.content.startsWith("!exec")) {
    if (message.channel.id !== ALLOWED_CHANNEL_ID) {
      return message.reply("❌ This command cannot be used in this channel.");
    }
    if (message.author.id !== ALLOWED_USER_ID) {
      return message.reply("❌ You are not authorized to use this command.");
    }

    const args = message.content.slice("!exec".length).trim().split(/ +/);
    if (!args.length) {
      return message.reply("⚠️ Please provide a command to execute.");
    }

    const cmd = args.join(" ");

    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        return message.reply(`❌ Error:\n\`\`\`\n${error.message}\n\`\`\``);
      }
      if (stderr) {
        return message.reply(`⚠️ Stderr:\n\`\`\`\n${stderr}\n\`\`\``);
      }

      const output =
        stdout.length > 1900 ? stdout.slice(0, 1900) + "..." : stdout;

      message.reply(`📟 Output:\n\`\`\`\n${output}\n\`\`\``);
    });

    return; // exit here to avoid running other commands on !exec
  }
  // === END of !exec command ===

  // Your existing messageCreate code below...

  const userId = message.author.id;
  const lastMessageTime = (await getBerries(`lastMessage_${userId}`)) || 0;
  const currentTime = Date.now();

  if (currentTime - lastMessageTime > 30000) {
    await addBerries(userId, 10);
    await setBerries(`lastMessage_${userId}`, currentTime);
  }

  if (message.content.startsWith("!bounty")) {
    const mentionedMember = message.mentions.members.first() || message.member;
    const userBerries = await getBerries(mentionedMember.id);
    const bountyMessage = `Bounty i **${mentionedMember.displayName}** është:`;
    await createBountyPoster(mentionedMember, userBerries, bountyMessage);
  }

  if (message.content === "!testwelcome") {
    client.emit("guildMemberAdd", message.member);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  const userId = user.id;
  const messageId = reaction.message.id;

  const reactedUsers = (await getBerries(`reactedUsers_${messageId}`)) || [];
  if (!reactedUsers.includes(userId)) {
    await addBerries(userId, 5);
    reactedUsers.push(userId);
    await setBerries(`reactedUsers_${messageId}`, reactedUsers);
  }
});

client.once("ready", () => {
  console.log(`🤖 Sunny u lidh si ${client.user.tag}`);
});

client.login(process.env.TOKEN);
