const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.cwd(), 'public', 'images');
const outputDir = path.join(process.cwd(), 'public', 'images', 'optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Optimization settings
const settings = {
  quality: 80, // Still high quality
  compressionLevel: 9, // Maximum compression
};

// Specific files to process
const targetFiles = [
  'page-noise-bunny.png',
  'page-noise-dune.png'
];

// Process specific noise images
async function optimizeImages() {
  for (const file of targetFiles) {
    const inputPath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file.replace('.png', '.webp'));

    try {
      await sharp(inputPath)
        .webp(settings)
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      
      console.log(`Optimized ${file}:`);
      console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Optimized size: ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`);
      console.log('---');
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
}

optimizeImages().catch(console.error); 