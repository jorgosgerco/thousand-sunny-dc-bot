const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "berries.json");

function getBerriesData() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      fs.writeFileSync(filePath, "{}", "utf8");
      return {};
    }
    console.error("Gabim gjatë leximit të berries.json:", error);
    return {};
  }
}

function saveBerriesData(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Gabim gjatë shkrimit në berries.json:", error);
  }
}

function getBerries(userId) {
  const data = getBerriesData();
  return data[userId] || 0;
}

function addBerries(userId, amount) {
  const data = getBerriesData();
  const currentBerries = data[userId] || 0;
  const newBerries = currentBerries + amount;
  data[userId] = newBerries;
  saveBerriesData(data);
  return newBerries;
}

function setBerries(userId, amount) {
  const data = getBerriesData();
  data[userId] = amount;
  saveBerriesData(data);
}

module.exports = { getBerries, addBerries, setBerries };
