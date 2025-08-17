# website-assets-generator

CLI pour générer automatiquement les assets d'un site web (favicons, icônes mobiles, manifest.json, browserconfig.xml, meta tags) à partir d'un logo PNG ou SVG.

## Installation

```bash
npm install
```

Installation locale globale pour un usage direct en CLI :

```bash
npm install -g .
```

## Utilisation

```bash
website-assets-generator --input logo.png --output ./dist
```

Options :

- `--input, -i` : chemin vers un logo PNG ou SVG
- `--output, -o` : dossier de sortie (défaut: `./dist`)
- `--name` : nom de l'application (défaut: `Website`)
- `--short-name` : nom court (défaut: `App`)
- `--theme-color` : couleur de thème hex (défaut: `#ffffff`)
- `--background-color` : couleur de fond hex (défaut: `#ffffff`)

## Fichiers générés

- `favicon.ico` (16x16, 32x32, 48x48)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `mstile-150x150.png`
- `manifest.json`
- `site.webmanifest`
- `safari-pinned-tab.svg`
- `browserconfig.xml`
- `meta-tags.html`

Tous les fichiers sont produits dans le dossier de sortie.

### Bonus

- Les fichiers SVG sont pris en charge et convertis en PNG avant redimensionnement via Sharp.

## Exemples

```bash
website-assets-generator -i ./assets/logo.svg -o ./public/icons --name "Mon Site" --short-name "Site" --theme-color "#0f172a" --background-color "#ffffff"
```

## Intégration HTML

Copier-coller le contenu de `meta-tags.html` dans la section `<head>` de votre page.
