const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

async function extractColors(filePath) {
    const fileContent = await readFileAsync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const colorTable = [];

    let currentSelector = '';

    lines.forEach((line, lineNumber) => {
        const selectorRegex = /([^{}]+)\s*{/;
        const selectorMatch = line.match(selectorRegex);

        if (selectorMatch) {
            // Update currentSelector when a new selector is found
            currentSelector = selectorMatch[1].trim();
        }

        const colorDirectiveRegex = /(?:background|color):[^;]*;/gi;
        let match;
        while ((match = colorDirectiveRegex.exec(line)) !== null) {
            const colorDirective = match[0];
            const colorValue = colorDirective.split(':')[1].trim();
            const byteLocation = fileContent.indexOf(colorDirective);
            const colorObject = {
                selector: currentSelector,
                directive: colorDirective,
                byteLocation,
                lineNumber,
                colorValue,
            };
            colorTable.push(colorObject);
        }
    });

    return colorTable;
}

const cssFilePath = 'C:\\Users\\VAISHNU\\Documents\\NodeJs\\test.css';
extractColors(cssFilePath)
    .then((colorTable) => {
        console.log(colorTable);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
