#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { generateAssets } = require('../src/generator');

function printHelp() {
  const help = [
    'Usage:',
    '  website-assets-generator --input <logo.(png|svg)> --output <dossier>',
    '',
    'Options:',
    '  --input, -i             Chemin du logo PNG ou SVG',
    '  --output, -o            Dossier de sortie (par défaut: ./dist)',
    "  --name                  Nom de l'application (par défaut: Website)",
    '  --short-name            Nom court (par défaut: App)',
    '  --theme-color           Couleur de thème hex (par défaut: #ffffff)',
    '  --background-color      Couleur de fond hex (par défaut: #ffffff)',
    "  --help, -h              Affiche l'aide"
  ].join('\n');
  console.log(help);
}

function getArg(argv, name, short) {
  const idx = argv.indexOf(name);
  if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('-')) return argv[idx + 1];
  if (short) {
    const sidx = argv.indexOf(short);
    if (sidx !== -1 && argv[sidx + 1] && !argv[sidx + 1].startsWith('-')) return argv[sidx + 1];
  }
  return undefined;
}

(async () => {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const inputPath = getArg(argv, '--input', '-i');
  const outputDir = getArg(argv, '--output', '-o') || './dist';
  const appName = getArg(argv, '--name') || 'Website';
  const shortName = getArg(argv, '--short-name') || 'App';
  const themeColor = getArg(argv, '--theme-color') || '#ffffff';
  const backgroundColor = getArg(argv, '--background-color') || '#ffffff';

  if (!inputPath) {
    console.error('Erreur: --input est requis');
    printHelp();
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Erreur: fichier introuvable: ${inputPath}`);
    process.exit(1);
  }

  try {
    await generateAssets({
      inputPath: path.resolve(inputPath),
      outputDir: path.resolve(outputDir),
      appName,
      shortName,
      themeColor,
      backgroundColor
    });
    console.log(`Assets générés dans ${path.resolve(outputDir)}`);
  } catch (err) {
    console.error(err.message || String(err));
    process.exit(1);
  }
})();
