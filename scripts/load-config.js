const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

function loadConfig(configFlags) {
  const profileName = configFlags[0] ? configFlags[0].slice(2) : "";
  const configFilePath = path.join(process.cwd(), "cyfga.config.json");

  if (fs.existsSync(configFilePath)) {
    let config = require(configFilePath);
    const profile = profileName || config._profile;

    if (profile) {
      config = getConfigWithProfile(config, configFilePath, profile);
    }

    return config;
  } else {
    // Fallback to default config if no user config is found
    const defaultConfigFilePath = path.resolve(
      __dirname,
      "./cyfga-default.config.json"
    );
    let defaultConfig = require(defaultConfigFilePath);
    const profile = profileName || defaultConfig._profile;

    if (profile) {
      defaultConfig = getConfigWithProfile(
        defaultConfig,
        defaultConfigFilePath,
        profile
      );
    }

    return defaultConfig;
  }
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
  const availableProfiles = config.profiles.reduce((acc, p) => {
    acc.push(p.name);
    return acc;
  }, []);

  const isAvailableProfile = availableProfiles.includes(profile);
  const profileName = isAvailableProfile ? profile : config._profile;
  let updatedConfig = { ...config, _profile: profileName };

  if (isAvailableProfile) {
    if (profile !== config._profile) {
      fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig));
    }
    console.log(chalk.black("Profile:"), chalk.blue(profile));
  } else {
    console.log(chalk.black("Profile does not exist:"), chalk.blue(profile));
    console.log(
      chalk.black("Using profile:"),
      chalk.blue(config._profile || "default")
    );
  }

  const profiles = config.profiles;
  const selectedProfile = profiles.filter((p) => p.name === profileName)[0];

  if (selectedProfile) {
    updatedConfig = mergeDefaultConfigWithProfileConfig(
      updatedConfig,
      selectedProfile
    );
  }

  return updatedConfig;
}

module.exports = loadConfig;
