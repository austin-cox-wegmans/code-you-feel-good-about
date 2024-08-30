const fs = require("fs");
const path = require("path");

function copyConfig() {
  const configFilePath = path.join(process.cwd(), "cyfga.config.json");
  const defaultConfigPath = path.join(__dirname, "cyfga-default.config.json");

  console.log({ configFilePath, defaultConfigPath });

  if (!fs.existsSync(configFilePath)) {
    fs.copyFileSync(defaultConfigPath, configFilePath);
    console.log("Config file created at:", configFilePath);
  } else {
    console.log("Config file already exists at:", configFilePath);
  }
}

copyConfig();

module.exports = copyConfig;
