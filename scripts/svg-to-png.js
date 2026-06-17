// Build-time helper: rasterize the transparent logo SVG into a transparent PNG.
// Usage: node scripts/svg-to-png.js [size]
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const size = Number(process.argv[2]) || 1024;
const srcPath = path.resolve(__dirname, '../assets/PotteryNookIcon1.svg');
const outPath = path.resolve(__dirname, '../assets/PotteryNookLogo.png');

const svg = fs.readFileSync(srcPath);
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: size },
  // No `background` option => fully transparent canvas.
});
const png = resvg.render().asPng();
fs.writeFileSync(outPath, png);

console.log(`Wrote ${outPath} at ${size}x${size} (${png.length} bytes)`);
