#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const loadConfig = require("./scripts/load-config");

const {
  excludeDirectories,
  baseDirectory,
  tests: { paths: testPaths, extensions: testExtensions },
  coverage: { extensions: componentExtensions },
} = loadConfig();

const rootDirectory = process.cwd();
const basePath = path.join(rootDirectory, baseDirectory);

function findFiles(basePath, component, isTestFile) {
  let result = null;

  function searchDir(dirPath) {
    const dirName = path.basename(dirPath);
    if (excludeDirectories.includes(dirName)) {
      return;
    }
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        searchDir(fullPath); // Recursive search
      } else if (file.isFile()) {
        const ext = path.extname(file.name);
        const isTest =
          file.name.startsWith(`${component}.test.`) &&
          testExtensions.includes(ext);
        const isComponent =
          file.name === `${component}${ext}` &&
          componentExtensions.includes(ext);
        if ((isTestFile && isTest) || (!isTestFile && isComponent)) {
          result = fullPath;
          break;
        }
      }
    }
  }
  searchDir(basePath);
  return result;
}

function codeYouFeelGoodAbout(components) {
  if (!components || components.length === 0) {
    console.error("Error: No component specified.");
    return;
  }

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
    const command = `jest ${allTests} --coverage ${allComponentPaths}`;
    console.log(`Running command TEST PATH: ${command}`);
    execSync(command, { stdio: "inherit" });
  }
}

// Parse command-line arguments and invoke codeYouFeelGoodAbout function
const args = process.argv.slice(2);

codeYouFeelGoodAbout(args);
