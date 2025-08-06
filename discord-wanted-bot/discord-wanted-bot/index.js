const { Client, GatewayIntentBits } = require("discord.js");
const { createBountyPoster } = require("./welcome.js");
const { getBerries, addBerries, setBerries } = require("./bounty.js");
const welcomeMessages = require("./welcome_messages.js");
const keepAlive = require("./keep_alive.js");
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

client.on("guildMemberAdd", async (member) => {
  const newBerries = await getBerries(member.user.id);
  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  const randomMessage = welcomeMessages[randomIndex].replace(
    /@nickname/g,
    `<@${member.id}>`,
  );

  await createBountyPoster(member, newBerries, randomMessage);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

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
