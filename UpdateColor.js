// Importation des modules requis
const fs = require('fs').promises; // Module pour travailler avec le système de fichiers de manière asynchrone
const readline = require('readline'); // Module pour lire les entrées de l'utilisateur depuis la ligne de commande

/**
 * Fonction asynchrone pour extraire les couleurs d'un fichier CSS.
 * @param {string} filePath Chemin du fichier CSS.
 * @returns {Promise<{ fileContent: string, colorTable: Array }>} Contenu du fichier et tableau d'objets de couleurs.
 */
async function extractColors(filePath) {
    // Lire le contenu du fichier
    const fileContent = await fs.readFile(filePath, 'utf8');
    // Tableau pour stocker les objets de couleurs
    const colorTable = [];

    // Expressions régulières pour correspondre aux directives de couleur et aux sélecteurs CSS
    const colorDirectiveRegex = /(color|background-color):\s*([^;]+);/gi;
    const selectorRegex = /([^{}]+)\s*{/;

    let currentSelector = ''; // Variable pour stocker le sélecteur CSS actuel

    // Parcourir chaque ligne du fichier
    fileContent.split('\n').forEach((line, lineNumber) => {
        const selectorMatch = line.match(selectorRegex);
        if (selectorMatch) {
            // Extraire et mettre à jour le sélecteur CSS actuel
            currentSelector = selectorMatch[1].trim();
        }

        // Rechercher les directives de couleur dans la ligne
        let match;
        while ((match = colorDirectiveRegex.exec(line)) !== null) {
            // Extraire le type de directive et la valeur de couleur
            const directiveType = match[1].trim();
            const colorValue = match[2].trim();
            const byteLocation = fileContent.indexOf(match[0]);

            // Créer un objet de couleur et l'ajouter au tableau de couleurs
            const colorObject = {
                selector: currentSelector,
                directive: `${directiveType}: ${colorValue};`,
                byteLocation,
                lineNumber,
                colorValue,
                newColor: null, // Nouvelle couleur, à définir ultérieurement
            };

            colorTable.push(colorObject);
        }
    });

    // Retourner le contenu du fichier et le tableau d'objets de couleurs
    return { fileContent, colorTable };
}

/**
 * Fonction asynchrone pour demander à l'utilisateur une valeur cible et une nouvelle couleur.
 * @returns {Promise<{ targetValue: string, newColor: string }>} Objet contenant la valeur cible et la nouvelle couleur.
 */
async function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Poser des questions à l'utilisateur et retourner les réponses sous forme de promesse
    return new Promise((resolve) => {
        rl.question('Entrez la valeur cible : ', (targetValue) => {
            rl.question('Entrez la nouvelle couleur : ', (newColor) => {
                rl.close();
                resolve({ targetValue, newColor });
            });
        });
    });
}

/**
 * Fonction asynchrone pour mettre à jour les couleurs dans le fichier CSS.
 * @param {string} fileContent Contenu du fichier CSS.
 * @param {Array} colorTable Tableau d'objets de couleurs.
 * @param {string} newFileName Nom du nouveau fichier CSS.
 * @returns {Promise<string>} Chemin du fichier CSS mis à jour.
 */
async function updateColorsInFile(fileContent, colorTable, newFileName) {
    // Parcourir le tableau d'objets de couleurs et mettre à jour le contenu du fichier avec les nouvelles couleurs
    colorTable.forEach((colorObject) => {
        if (colorObject.newColor !== null) {
            fileContent = fileContent.replace(
                colorObject.directive,
                `color: ${colorObject.newColor};`
            );
        }
    });

    // Définir le chemin du fichier mis à jour
    const updatedFilePath = newFileName || 'updated.css';
    // Écrire le contenu mis à jour dans le fichier
    await fs.writeFile(updatedFilePath, fileContent, 'utf8');
    // Retourner le chemin du fichier mis à jour
    return updatedFilePath;
}

/**
 * Fonction asynchrone pour demander à l'utilisateur le nom du nouveau fichier CSS.
 * @returns {Promise<string>} Nom du nouveau fichier CSS.
 */
async function promptForFilename() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Poser une question à l'utilisateur et retourner sa réponse sous forme de promesse
    return new Promise((resolve) => {
        rl.question('Entrez le nom du nouveau fichier CSS (avec l\'extension .css) : ', (filename) => {
            rl.close();
            resolve(filename);
        });
    });
}

/**
 * Fonction principale asynchrone.
 */
async function main() {
    try {
        // Chemin du fichier CSS initial
        const cssFilePath = 'test.css';

        // Extraire les couleurs du fichier CSS
        const { fileContent, colorTable } = await extractColors(cssFilePath);
        console.log(colorTable); // Afficher le tableau d'objets de couleurs

        // Demander à l'utilisateur la valeur cible et la nouvelle couleur
        const userInput = await promptUser();
        const { targetValue, newColor } = userInput;

        // Mettre à jour les nouvelles couleurs dans le tableau d'objets de couleurs
        colorTable.forEach((colorObject) => {
            if (colorObject.colorValue === targetValue) {
                colorObject.newColor = newColor;
            }
        });

        // Filtrer les couleurs qui n'ont pas été mises à jour
        const unchangedColors = colorTable.filter((colorObject) => colorObject.newColor === null);
        if (unchangedColors.length > 0) {
            console.log('Les couleurs suivantes n\'ont pas été mises à jour :');
            console.log(unchangedColors);
        }

        // Demander à l'utilisateur le nom du nouveau fichier CSS
        const newFileName = await promptForFilename();
        // Mettre à jour les couleurs dans le fichier CSS et enregistrer le fichier
        const updatedFilePath = await updateColorsInFile(fileContent, colorTable, newFileName);

        // Afficher un message de réussite avec le chemin du fichier mis à jour
        console.log(`Fichier CSS modifié enregistré avec succès : ${updatedFilePath}`);
    } catch (error) {
        console.error('Erreur :', error); // Gérer les erreurs
    }
}

// Appeler la fonction principale pour démarrer le programme
main();
