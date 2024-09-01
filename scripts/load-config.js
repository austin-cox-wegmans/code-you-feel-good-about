const chalk = require("chalk");
const fs = require("fs");
const getConfigPath = require("./get-config-path");

function loadConfig(profileName) {
  const configFilePath = getConfigPath();

  let config = require(configFilePath);
  const profile = profileName || config._profile;
  if (profile) {
    config = getConfigWithProfile(config, configFilePath, profile);
  }

  return config;
}

function mergeDefaultConfigWithProfileConfig(defaultConfig, selectedProfile) {
  const { overrides } = selectedProfile;
  const overrideData = getOverrideData(overrides);
  let current = defaultConfig;

  for (const configOption of overrideData) {
    const { path, override } = configOption;
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

  return overrideData;
}

function getConfigWithProfile(config, configFilePath, profile) {
  let updatedConfig = { ...config, _profile: profile };

  if (profile !== config._profile) {
    fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig));
  }

  const profiles = config.profiles;
  const selectedProfile = profiles.filter((p) => p.name === profile)[0];

  updatedConfig = mergeDefaultConfigWithProfileConfig(
    updatedConfig,
    selectedProfile
  );

  console.log(chalk.black("Profile:"), chalk.blue(profile));
  console.log("");

  return updatedConfig;
}

module.exports = loadConfig;
