#!/usr/bin/env node

const { execSync } = require("child_process");
const findFiles = require("./utilities/find-files");
const loadConfig = require("./scripts/load-config");
const path = require("path");

function codeYouFeelGoodAbout(components) {
  if (!components || components.length === 0) {
    console.error("Error: No component specified.");
    return;
  }

  const {
    baseDirectory,
    tests: { paths: testPaths },
  } = loadConfig();

  const rootDirectory = process.cwd();
  const basePath = path.join(rootDirectory, baseDirectory);
  let allTests = "";
  let allComponentPaths = "";

  components.forEach((component) => {
    let testFile = null;
    let componentFile = null;

    // Search for the test file
    for (const testingPath of testPaths) {
      const fullPath = path.join(basePath, testingPath);
      testFile = findFiles(fullPath, component, true);
      if (testFile) break;
    }

    // Search for the component file

    // to do: need two different path arrays. One for test paths and one for component paths
    for (const testingPath of testPaths) {
      const fullPath = path.join(basePath, testingPath);
      componentFile = findFiles(fullPath, component, false);
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
        console.warn(`No test file found for ${component}`);
      }
      if (!componentFile) {
        console.warn(`No component file found for ${component}`);
      }
    }
  });

  if (allTests.length > 0) {
    const command = `jest ${allTests} --coverage ${allComponentPaths} --verbose`;
    console.log(`Running command: ${command}`);
    execSync(command, { stdio: "inherit" });
  }
}

// Parse command-line arguments and invoke codeYouFeelGoodAbout function
const args = process.argv.slice(2);

codeYouFeelGoodAbout(args);
