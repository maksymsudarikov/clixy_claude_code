/**
 * Generate PWA icons from SVG
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Read SVG template
const svgTemplate = fs.readFileSync(svgPath, 'utf-8');

console.log('📦 Generating PWA icons...\n');

// For browsers that support SVG directly, we can use the same SVG
// but for PNG we'll create a simple placeholder that says "Install Sharp"
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const outputPath = path.join(outputDir, filename);

  // Create a scaled SVG for each size
  const scaledSVG = svgTemplate
    .replace('width="512"', `width="${size}"`)
    .replace('height="512"', `height="${size}"`);

  // Save as SVG (browsers can use this directly)
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgOutputPath = path.join(outputDir, svgFilename);
  fs.writeFileSync(svgOutputPath, scaledSVG);
  console.log(`✅ Created ${svgFilename}`);
});

console.log('\n✨ SVG icons generated!');
console.log('\n⚠️  For PNG conversion, run: npm install sharp --save-dev');
console.log('   Then run this script again.\n');
