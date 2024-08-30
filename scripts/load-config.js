const fs = require("fs");
const path = require("path");
// const copyConfig = require("./copy-config");

function loadConfig() {
  //   copyConfig();
  console.log(process.cwd());
  const configFilePath = path.join(process.cwd(), "cyfga.config.json");
  if (fs.existsSync(configFilePath)) {
    const userConfig = require(configFilePath);
    console.log("USER");
    return userConfig;
  } else {
    // Fallback to default config if no user config is found

    return require("./cyfga-default.config.json");
  }
}

module.exports = loadConfig;
