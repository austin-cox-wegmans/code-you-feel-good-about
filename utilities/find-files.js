const fs = require("fs");
const loadConfig = require("../scripts/load-config");
const path = require("path");

const {
  coverage: { extensions: componentExtensions },
  excludeDirectories,
  tests: { extensions: testExtensions },
} = loadConfig();

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

module.exports = findFiles;
