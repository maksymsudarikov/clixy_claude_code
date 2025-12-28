/**
 * Generate PWA assets (icons + service worker)
 * Run with: node scripts/generate-pwa-assets.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

console.log('📦 Generating PWA icons...\n');

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
  console.log('✅ Sharp is available, generating PNG icons...\n');

  // Read SVG
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG for each size
  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`;
    const outputPath = path.join(outputDir, filename);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Created ${filename}`);
  }

  console.log('\n✨ All PNG icons generated successfully!\n');
} catch (error) {
  console.log('⚠️  Sharp not available, using SVG icons only');
  console.log('   To generate PNG icons, run: npm install sharp --save-dev\n');

  // Copy SVG as fallback
  sizes.forEach(size => {
    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const scaledSVG = svgContent
      .replace('width="512"', `width="${size}"`)
      .replace('height="512"', `height="${size}"`);

    const svgFilename = `icon-${size}x${size}.svg`;
    const svgOutputPath = path.join(outputDir, svgFilename);
    fs.writeFileSync(svgOutputPath, scaledSVG);
  });
}

console.log('✅ PWA assets generation complete!\n');
