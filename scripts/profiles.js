const getConfigPath = require("./get-config-path");

function getAvailableProfiles() {
  const configPath = getConfigPath();
  const config = require(configPath);
  const availableProfiles = config.profiles.reduce((acc, p) => {
    acc.push(p.name);
    return acc;
  }, []);

  const sortedProfiles = availableProfiles.sort();

  const activeProfile = config._profile;

  return { activeProfile, profiles: sortedProfiles };
}

function validateProfiles(profiles) {
  const { profiles: availableProfiles } = getAvailableProfiles();

  const validProfiles = [];
  for (const profile of profiles) {
    if (availableProfiles.includes(profile)) {
      validProfiles.push(profile);
    }
  }
  return validProfiles;
}

module.exports = {
  getAvailableProfiles,
  validateProfiles,
};
