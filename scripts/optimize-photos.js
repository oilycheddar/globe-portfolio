const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.cwd(), 'public', 'photography');
const outputDir = path.join(process.cwd(), 'public', 'photography', 'optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Optimization settings
const settings = {
  quality: 80, // Still high quality
  compressionLevel: 9, // Maximum compression
};

// Process all images in the photography directory
async function optimizePhotos() {
  const files = fs.readdirSync(sourceDir);
  
  for (const file of files) {
    // Skip if not an image file
    if (!['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())) {
      continue;
    }

    const inputPath = path.join(sourceDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.[^/.]+$/, '.webp'));

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

optimizePhotos().catch(console.error); 