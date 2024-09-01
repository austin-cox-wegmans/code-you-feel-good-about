const fs = require("fs");
const path = require("path");

function getConfigPath() {
  const configFilePath = path.join(process.cwd(), "cyfga.config.json");

  if (fs.existsSync(configFilePath)) {
    return configFilePath;
  }

  const defaultConfigFilePath = path.resolve(
    __dirname,
    "./cyfga-default.config.json"
  );

  return defaultConfigFilePath;
}

module.exports = getConfigPath;
