#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findFiles(basePath, component, extensions, isTestFile) {
    let result = null;

    function searchDir(dirPath) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const file of files) {
            const fullPath = path.join(dirPath, file.name);

            if (file.isDirectory()) {
                searchDir(fullPath);  // Recursive search
            } else if (file.isFile()) {
                const ext = path.extname(file.name);
                const isTest = file.name.startsWith(`${component}.test.`) && extensions.includes(ext);
                const isComponent = file.name === `${component}${ext}` && extensions.includes(ext);
                if ((isTestFile && isTest) || (!isTestFile && isComponent)) {
                    result = fullPath;
                    break;  // Exit early if file is found
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

    const basePath = path.resolve(process.cwd());
    const testingPaths = ["components", "hooks", "stores", "utilities"];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    let allTests = ""
    let allComponentPaths = ""

    components.forEach(component => {
        let testFile = null;
        let componentFile = null;

        // Search for the test file
        for (const testingPath of testingPaths) {
            const fullPath = path.join(basePath, testingPath);
            testFile = findFiles(fullPath, component, extensions, true);
            if (testFile) break;
        }

        // Search for the component file
        for (const testingPath of testingPaths) {
            const fullPath = path.join(basePath, testingPath);
            componentFile = findFiles(fullPath, component, extensions, false);
            if (componentFile) break;
        }

        if (testFile && componentFile) {
            const relativeComponentPath = path.relative(basePath, componentFile).replace(/\\/g, '/');
            allTests += `/${path.basename(testFile)} `
            allComponentPaths += `--collectCoverageFrom='**/${relativeComponentPath}' `
        } else {
            if (!testFile) {
                console.warn(`No test file found for ${component}`);
            }
            if (!componentFile) {
                console.warn(`No component file found for ${component}`);
            }
        }
    });
    const command = `jest ${allTests} --coverage ${allComponentPaths}`;
    console.log(`Running command: ${command}`);
    execSync(command, { stdio: 'inherit' });
}

// Parse command-line arguments and invoke codeYouFeelGoodAbout function
const args = process.argv.slice(2);

codeYouFeelGoodAbout(args);