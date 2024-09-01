#!/usr/bin/env node

const chalk = require("chalk");
const { execSync } = require("child_process");
const findFiles = require("./utilities/find-files");
const loadConfig = require("./scripts/load-config");
const path = require("path");

function codeYouFeelGoodAbout(args) {
  if (!args || args.length === 0) {
    console.error("Error: Please provide a file or config flag.");
    return;
  }

  const components = args.filter((arg) => !arg.startsWith("--"));
  const configFlags = args.filter((arg) => arg.startsWith("--"));

  const config = loadConfig(configFlags);

  if (config.error) {
    console.error(config.error);
    return;
  }

  const {
    baseDirectory,
    tests: { paths: testPaths },
    coverage: { paths: coveragePaths },
  } = config;

  const basePath = path.join(process.cwd(), baseDirectory);
  let allTests = "";
  let allComponentPaths = "";

  components.forEach((component) => {
    let testFile = null;
    let componentFile = null;

    // Search for the test file
    for (const testingPath of testPaths) {
      const fullPath = path.join(basePath, testingPath);
      testFile = findFiles(fullPath, component, config, true);
      if (testFile) break;
    }

    // Search for the component file
    for (const testingPath of coveragePaths) {
      const fullPath = path.join(basePath, testingPath);
      componentFile = findFiles(fullPath, component, config, false);
      if (componentFile) break;
    }

    if (testFile && componentFile) {
      const relativeComponentPath = path
        .relative(basePath, componentFile)
        .replace(/\\/g, "/");
      allTests += `/${path.basename(testFile)} `;
      allComponentPaths += `--collectCoverageFrom='**/${relativeComponentPath}' `;
    } else {
      if (!testFile) {
        console.log(chalk.black("No test file found:"), chalk.red(component));
      }
      if (!componentFile) {
        console.log(chalk.black("No file found:"), chalk.red(component));
      }
    }
  });

  if (allTests.length > 0) {
    const command = `jest ${allTests} --coverage ${allComponentPaths} --verbose`;
    console.log(
      chalk.black("Running tests for:"),
      chalk.blue(allTests.replace(/\//g, ""))
    );
    try {
      execSync(command, { stdio: "inherit" });
    } catch (error) {
      console.log("There was an error executing the command");
      console.error(error.message);
    }
  }
}

// Parse command-line arguments and invoke codeYouFeelGoodAbout function
const args = process.argv.slice(2);

codeYouFeelGoodAbout(args);
