// welcome.js
const { createCanvas, loadImage, registerFont } = require("canvas");
const fetch = require("node-fetch");

// Regjistro fontet
registerFont("./assets/fonts/AlwaysInMyHeart.ttf", {
  family: "Always In My Heart",
});
registerFont("./assets/fonts/PlayfairDisplay-Bold.ttf", {
  family: "Playfair Display",
});

// Funksion për crop qendror square nga një imazh origjinal
function getCenterCropCoords(imgWidth, imgHeight) {
  const side = Math.min(imgWidth, imgHeight);
  const sx = (imgWidth - side) / 2;
  const sy = (imgHeight - side) / 2;
  return { sx, sy, sWidth: side, sHeight: side };
}

// Funksion për pastrimin e emrit nga karaktere jo latine dhe emoji
function cleanUsername(name) {
  if (!name) return "";
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();
}

// Funksioni për krijimin e posterit me një vlerë bounty specifike
async function createBountyPoster(member, bountyValue, messageContent) {
  try {
    const canvas = createCanvas(877, 1240);
    const ctx = canvas.getContext("2d");

    const background = await loadImage("./assets/wanted-bosh.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarURL = member.user.displayAvatarURL({
      extension: "png",
      size: 1024,
    });

    const response = await fetch(avatarURL);
    const avatarBuffer = await response.buffer();
    const avatarImage = await loadImage(avatarBuffer);

    // Zona ku do të vendoset imazhi i profilit në poster
    const destX = 82;
    const destY = 268;
    const destWidth = 712;
    const destHeight = 515;

    // Llogaritja e raporteve
    const destRatio = destWidth / destHeight;
    const sourceRatio = avatarImage.width / avatarImage.height;

    let sourceX, sourceY, sourceWidth, sourceHeight;

    if (sourceRatio > destRatio) {
      // Imazhi i burimit është më i gjerë se sa destinacioni, prandaj pritet në anët
      sourceHeight = avatarImage.height;
      sourceWidth = avatarImage.height * destRatio;
      sourceX = (avatarImage.width - sourceWidth) / 2;
      sourceY = 0;
    } else {
      // Imazhi i burimit është më i gjatë se sa destinacioni, prandaj pritet nga lart dhe poshtë
      sourceWidth = avatarImage.width;
      sourceHeight = avatarImage.width / destRatio;
      sourceX = 0;
      sourceY = (avatarImage.height - sourceHeight) / 2;
    }

    // Vizato imazhin e profilit me prerje (crop) dhe pa shtrirje (stretch)
    ctx.drawImage(
      avatarImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destX,
      destY,
      destWidth,
      destHeight,
    );

    let displayName = member.nickname || member.user.username;
    if (!displayName) {
      displayName = member.guild.name;
    }

    displayName = cleanUsername(displayName);
    if (displayName.length > 10) {
      displayName = displayName.slice(0, 10);
    }
    displayName = displayName.toUpperCase();

    ctx.font = "bold 105px Playfair Display";
    ctx.fillStyle = "#412f17";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayName, 440, 954.5);

    ctx.font = "bold 100px Always In My Heart";
    ctx.fillStyle = "#412f17";
    ctx.fillText(bountyValue.toLocaleString(), 425, 1080);

    const buffer = canvas.toBuffer();

    const channelId = "1136334194218389685";
    const channel = member.guild.channels.cache.get(channelId);

    if (!channel) {
      console.log("Kanal i panjohur me ID:", channelId);
      return;
    }

    await channel.send({
      content: messageContent,
      files: [{ attachment: buffer, name: "bounty.png" }],
    });
  } catch (error) {
    console.error("Gabim gjatë krijimit të posterit:", error);
  }
}

module.exports = { createBountyPoster };
