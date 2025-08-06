const express = require("express");
const app = express();

function keepAlive() {
  app.listen(3000, () => {
    console.log("Web server is running!");
  });
}

module.exports = keepAlive;
