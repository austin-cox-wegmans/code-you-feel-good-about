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
                if (isTestFile) {
                    if (file.name.startsWith(`${component}.test.`) && extensions.includes(ext)) {
                        result = fullPath;
                    }
                } else {
                    if (extensions.includes(ext) && file.name === `${component}${ext}`) {
                        result = fullPath;
                    }
                }
            }

            if (result) break;  // Exit early if file is found
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
            const relativeComponentPath = componentFile.replace(`${basePath}`, '**');
            const formattedRelativeComponentPath = relativeComponentPath.replace(/\\/g, '/');
            const formattedTestFile = path.basename(testFile)
            const command = `jest /${formattedTestFile} --coverage --collectCoverageFrom='${formattedRelativeComponentPath}'`;
            console.log(`Running command: ${command}`);
            execSync(command, { stdio: 'inherit' });
        } else {
            if (!testFile) {
                console.warn(`No test file found for ${component}`);
            }
            if (!componentFile) {
                console.warn(`No component file found for ${component}`);
            }
        }
    });
}

// Parse command-line arguments and invoke jjjest function
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("Error: No components specified.");
    process.exit(1);
}

codeYouFeelGoodAbout(args);
