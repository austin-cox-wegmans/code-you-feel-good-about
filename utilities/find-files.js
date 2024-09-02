const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

function findFiles(basePath, component, config, isTestFile) {
  const {
    coverage: { extensions: componentExtensions },
    excludeDirectories,
    tests: { extensions: testExtensions },
  } = config;
  let result = null;

  function searchDir(dirPath) {
    const dirName = path.basename(dirPath);

    if (excludeDirectories.includes(dirName)) {
      return;
    }

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
          searchDir(fullPath); // Recursive search
        } else if (file.isFile()) {
          // path.extname() gets only last part of extension - file.tsx -> .tsx - file.test.ts -> .ts
          const ext = path.extname(file.name);

          // file and test file will look like "component" - so search component.extension
          // check if file is the one we are looking
          let isComponent = file.name === `${component}${ext}`;
          // if user has custom extensions configuration - check if file found is one of those extensions
          if (componentExtensions.length > 0) {
            isComponent = isComponent && componentExtensions.includes(ext);
          }

          // test file will look like component.test.js - search for component.test
          let isTest = file.name.startsWith(`${component}.test.`);
          if (testExtensions.length > 0) {
            isTest = isTest && testExtensions.includes(ext);
          }

          if ((isTestFile && isTest) || (!isTestFile && isComponent)) {
            result = fullPath;
            break;
          }
        }
      }
    } catch (error) {
      console.log(
        chalk.grey("No directory found at:"),
        chalk.red(`/${dirPath}`)
      );
      console.log(chalk.grey("Check the paths in your configuration file"));
      console.log("");
    }
  }
  searchDir(basePath);
  return result;
}

module.exports = findFiles;
