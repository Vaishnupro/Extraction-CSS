// Importation du module 'fs' (File System) pour travailler avec les fichiers,
// du module 'readline' pour lire les fichiers ligne par ligne,
// et de la fonction 'promisify' du module 'util' pour transformer des fonctions callback en fonctions promesses.
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

// Transformation de la fonction 'readFile' de 'fs' en une fonction qui renvoie une promesse.
const readFileAsync = promisify(fs.readFile);

// Définition d'une fonction asynchrone qui extrait les informations sur les couleurs d'un fichier CSS.
async function extractColors(filePath) {
    // Lecture du contenu du fichier de manière asynchrone.
    const fileContent = await readFileAsync(filePath, 'utf8');

    // Division du contenu du fichier en lignes.
    const lines = fileContent.split('\n');

    // Initialisation d'un tableau pour stocker les informations sur les couleurs.
    const colorTable = [];

    // Initialisation d'une variable pour suivre le sélecteur CSS actuel.
    let currentSelector = '';

    // Parcours de chaque ligne du fichier.
    lines.forEach((line, lineNumber) => {
        // Expression régulière pour rechercher un sélecteur CSS.
        const selectorRegex = /([^{}]+)\s*{/;
        const selectorMatch = line.match(selectorRegex);

        if (selectorMatch) {
            // Mise à jour du sélecteur actuel lorsqu'un nouveau sélecteur est trouvé.
            currentSelector = selectorMatch[1].trim();
        }


        // Expression régulière pour rechercher une directive de couleur (background ou color) dans une ligne.
        const colorDirectiveRegex = /(?:background|color):[^;]*;/gi;
        let match;
        while ((match = colorDirectiveRegex.exec(line)) !== null) {
            // Extraction de la directive de couleur et de la valeur de couleur.
            const colorDirective = match[0];
            const colorValue = colorDirective.split(':')[1].trim();

            // Détermination de la position de la directive de couleur dans le fichier.
            const byteLocation = fileContent.indexOf(colorDirective);

            // Création d'un objet contenant les informations sur la couleur.
            const colorObject = {
                selector: currentSelector,
                directive: colorDirective,
                byteLocation,
                lineNumber,
                colorValue,
            };

            // Ajout de l'objet au tableau des couleurs.
            colorTable.push(colorObject);
        }
    });

    // Retour du tableau des couleurs.
    return colorTable;
}

// Chemin du fichier CSS à traiter.
const cssFilePath = 'C:\\Users\\VAISHNU\\Documents\\NodeJs\\test.css';

// Appel de la fonction extractColors avec le chemin du fichier en argument.
// Affichage du tableau des couleurs ou gestion des erreurs.
extractColors(cssFilePath)
    .then((colorTable) => {
        console.log(colorTable);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
