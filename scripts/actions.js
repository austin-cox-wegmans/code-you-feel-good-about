const chalk = require("chalk");
const fs = require("fs");
const getConfigPath = require("./get-config-path");
const { getAvailableProfiles } = require("./profiles");

function displayAvailableProfiles() {
  const { activeProfile, profiles } = getAvailableProfiles();

  console.log(chalk.black("Available profiles:"));

  for (const profile of profiles) {
    if (profile !== activeProfile) {
      console.log(chalk.black("  ▪"), chalk.blue(profile));
    } else {
      console.log(chalk.green(`  ▪ ${activeProfile}`));
    }
  }
}

function resetConfigToDefault() {
  const configPath = getConfigPath();
  const config = require(configPath);
  const updatedConfig = { ...config, _profile: "" };

  fs.writeFileSync(configPath, JSON.stringify(updatedConfig));

  console.log(chalk.green("Reset to default configuration"));
}

async function hehe() {
  const colors = [
    chalk.red,
    chalk.green,
    chalk.yellow,
    chalk.blue,
    chalk.magenta,
    chalk.cyan,
    chalk.white,
  ];
  const text = "every day you get our jest";

  hideCursor();

  console.log("");

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.trim()) {
      // Only colorize non-whitespace characters
      process.stdout.write(colors[i % colors.length](char));
    } else {
      process.stdout.write(char);
    }
    await delay(10);
  }

  console.log("");

  await delay(1000);
  showCursor();
}

function hotdog() {
  for (let i = 0; i < 25; i++) {
    console.log("meow");
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hideCursor() {
  process.stdout.write("\x1B[?25l");
}

function showCursor() {
  process.stdout.write("\x1B[?25h");
}

module.exports = {
  displayAvailableProfiles,
  resetConfigToDefault,
  hehe,
  hotdog,
};
