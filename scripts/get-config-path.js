const fs = require("fs");
const path = require("path");

function getConfigPath() {
  const userConfigFilePath = path.join(process.cwd(), "cyfga.config.json");

  const defaultConfigFilePath = path.resolve(
    __dirname,
    "./cyfga-default.config.json"
  );

  if (fs.existsSync(userConfigFilePath)) {
    return { defaultConfigFilePath, userConfigFilePath };
  }

  return { defaultConfigFilePath };
}

module.exports = getConfigPath;
