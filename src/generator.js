const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function generatePng(inputPath, size, destPath, options) {
  const fitOptions = { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } };
  let image = sharp(inputPath).resize(size, size, fitOptions);
  if (options && options.flattenBackgroundColor) {
    image = image.flatten({ background: options.flattenBackgroundColor });
  }
  await image.png().toFile(destPath);
}

async function generateFaviconIco(inputPath, destPath, backgroundColor) {
  const fitOptions = { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } };
  const sizes = [16, 32, 48];
  const buffers = [];
  for (const s of sizes) {
    let img = sharp(inputPath).resize(s, s, fitOptions).flatten({ background: backgroundColor });
    const buf = await img.png().toBuffer();
    buffers.push(buf);
  }
  const ico = await pngToIco(buffers);
  await fs.writeFile(destPath, ico);
}

async function generateSafariPinnedTab(inputPath, destPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.svg') {
    await fs.copyFile(inputPath, destPath);
    return;
  }
  const buffer = await sharp(inputPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .threshold(200)
    .png()
    .toBuffer();
  const base64 = buffer.toString('base64');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\n  <image href="data:image/png;base64,${base64}" width="512" height="512"/>\n</svg>\n`;
  await fs.writeFile(destPath, svg, 'utf8');
}

async function writeManifest(destPath, data) {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(destPath, json, 'utf8');
}

async function writeBrowserConfig(destPath, tileColor) {
  const xml = `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square150x150logo src="mstile-150x150.png"/>\n      <TileColor>${tileColor}</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>\n`;
  await fs.writeFile(destPath, xml, 'utf8');
}

async function writeMetaTags(destPath, options) {
  const lines = [
    '<link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48">',
    '<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">',
    '<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">',
    '<link rel="icon" type="image/png" sizes="192x192" href="android-chrome-192x192.png">',
    '<link rel="icon" type="image/png" sizes="512x512" href="android-chrome-512x512.png">',
    '<link rel="manifest" href="manifest.json">',
    '<link rel="manifest" href="site.webmanifest">',
    `<link rel="mask-icon" href="safari-pinned-tab.svg" color="${options.themeColor}">`,
    `<meta name="application-name" content="${options.appName}">`,
    `<meta name="theme-color" content="${options.themeColor}">`,
    `<meta name="msapplication-TileColor" content="${options.themeColor}">`,
    '<meta name="msapplication-config" content="browserconfig.xml">'
  ];
  const content = lines.join('\n') + '\n';
  await fs.writeFile(destPath, content, 'utf8');
}

async function generateAssets(params) {
  const inputPath = params.inputPath;
  const outputDir = params.outputDir;
  const appName = params.appName || 'Website';
  const shortName = params.shortName || 'App';
  const themeColor = params.themeColor || '#ffffff';
  const backgroundColor = params.backgroundColor || '#ffffff';

  await ensureDir(outputDir);

  const appleIcon = path.join(outputDir, 'apple-touch-icon.png');
  const android192 = path.join(outputDir, 'android-chrome-192x192.png');
  const android512 = path.join(outputDir, 'android-chrome-512x512.png');
  const msTile150 = path.join(outputDir, 'mstile-150x150.png');
  const faviconIco = path.join(outputDir, 'favicon.ico');
  const favicon16 = path.join(outputDir, 'favicon-16x16.png');
  const favicon32 = path.join(outputDir, 'favicon-32x32.png');
  const safariPinned = path.join(outputDir, 'safari-pinned-tab.svg');
  const manifestJson = path.join(outputDir, 'manifest.json');
  const siteWebmanifest = path.join(outputDir, 'site.webmanifest');
  const browserConfigXml = path.join(outputDir, 'browserconfig.xml');
  const metaTagsHtml = path.join(outputDir, 'meta-tags.html');

  await generatePng(inputPath, 180, appleIcon, { flattenBackgroundColor: backgroundColor });
  await generatePng(inputPath, 192, android192);
  await generatePng(inputPath, 512, android512);
  await generatePng(inputPath, 150, msTile150, { flattenBackgroundColor: backgroundColor });
  await generatePng(inputPath, 16, favicon16);
  await generatePng(inputPath, 32, favicon32);
  await generateFaviconIco(inputPath, faviconIco, backgroundColor);
  await generateSafariPinnedTab(inputPath, safariPinned);

  const manifest = {
    name: appName,
    short_name: shortName,
    icons: [
      { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: themeColor,
    background_color: backgroundColor,
    display: 'standalone',
    start_url: '/',
    scope: '/'
  };
  await writeManifest(manifestJson, manifest);
  await writeManifest(siteWebmanifest, manifest);

  await writeBrowserConfig(browserConfigXml, themeColor);
  await writeMetaTags(metaTagsHtml, { appName, themeColor });
}

module.exports = { generateAssets };
