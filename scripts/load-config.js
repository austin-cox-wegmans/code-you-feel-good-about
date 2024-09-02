const chalk = require("chalk");
const fs = require("fs");
const getConfigPath = require("./get-config-path");

function loadConfig(profileName) {
  const { defaultConfigFilePath, userConfigFilePath } = getConfigPath();
  const configPath = userConfigFilePath || defaultConfigFilePath;

  let defaultConfig = require(defaultConfigFilePath);
  let config = defaultConfig;

  if (userConfigFilePath) {
    config = require(userConfigFilePath);
  }

  profileName = profileName || config._profile;
  let updatedConfig = { ...config, _profile: profileName };

  if (profileName !== config._profile) {
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig));
  }

  const profiles = config.profiles;
  const profile = profiles.filter((p) => p.name === profileName)[0];

  if (profile) {
    config = mergeDefaultConfigWithProfileConfig(defaultConfig, profile);

    console.log(chalk.grey("Profile:"), chalk.yellow(profileName));
    console.log("");
  }

  return config;
}

function mergeDefaultConfigWithProfileConfig(defaultConfig, profile) {
  // remove name from config overrides
  delete profile.name;

  const overrideData = getOverrideData(profile);

  let current = defaultConfig;

  for (const configOption of overrideData) {
    const { path, override } = configOption;

    // if user provides empty override - skip
    if (override.length === 0) {
      break;
    }
    const pathNames = path.split("/");
    for (let i = 0; i < pathNames.length - 1; i++) {
      current = current[pathNames[i]];
    }

    //update the value in defaultConfig with the override value
    current[pathNames[pathNames.length - 1]] = override;
    current = defaultConfig;
  }

  return defaultConfig;
}

function getOverrideData(current, overridePath = "") {
  const overrideData = [];
  let overrideOptions = "";
  for (const key in current) {
    const currentPath = overridePath ? `${overridePath}/${key}` : key;
    if (typeof current[key] === "object" && !Array.isArray(current[key])) {
      overrideData.push(...getOverrideData(current[key], currentPath));
    } else {
      overrideOptions = current[key];
      overrideData.push({ path: currentPath, override: overrideOptions });
    }
  }

  // remove empty strings from the data
  const formattedOverrideData = overrideData.filter(Boolean);

  return formattedOverrideData;
}

function getConfigWithProfile(config, profile) {
  // const profiles = config.profiles;
  // const selectedProfile = profiles.filter((p) => p.name === profile)[0];

  // console.log({ updatedConfig, profile });

  const updatedConfig = mergeDefaultConfigWithProfileConfig(config, profile);

  console.log(chalk.grey("Profile:"), chalk.yellow(profile.name));
  console.log("");

  return updatedConfig;
}

module.exports = loadConfig;
