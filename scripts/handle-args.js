const {
  displayAvailableProfiles,
  hehe,
  hotdog,
  resetConfigToDefault,
} = require("./actions");
const chalk = require("chalk");
const { validateProfiles } = require("./profiles");
const actions = ["reset", "profiles", "wegs", "hotdog"];

function handleArgs(args) {
  let shouldExitProgram = false;

  const components = args.filter((arg) => !arg.startsWith("--"));
  const flags = args.filter((arg) => arg.startsWith("--"));

  const formattedFlags = flags
    .map((flag) => flag.split(/--/g).filter(Boolean))
    .flat(1);

  let profiles = [];
  let requestedActions = [];

  for (const flag of formattedFlags) {
    if (actions.includes(flag)) {
      requestedActions.push(flag);
    } else {
      profiles.push(flag);
    }
  }

  // handle requested actions
  if (requestedActions.length > 0) {
    for (const action of requestedActions) {
      switch (action) {
        case "reset":
          resetConfigToDefault();
          shouldExitProgram = true;
          break;
        case "profiles":
          displayAvailableProfiles();
          shouldExitProgram = true;
          break;
        case "wegs":
          hehe();
          shouldExitProgram = true;
          break;
        case "hotdog":
          hotdog();
          shouldExitProgram = true;
          break;
      }
    }
  }

  const availableProfiles = validateProfiles(profiles);
  const profile = availableProfiles[availableProfiles.length - 1];
  const invalidProfile = profiles[profiles.length - 1];

  if (!profile && invalidProfile) {
    console.log(
      chalk.black("Profile does not exist:"),
      chalk.yellow(invalidProfile)
    );
    shouldExitProgram = true;
  }

  return { components, profile, shouldExitProgram };
}

module.exports = handleArgs;
