const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const optimizedDir = path.join(process.cwd(), 'public', 'images', 'optimized');

// Settings for quality reduction
const settings = {
  quality: 70,
  compressionLevel: 9,
};

// Get all page-noise files (including slime_page_noise)
const pageNoiseFiles = fs.readdirSync(optimizedDir)
  .filter(file => (file.startsWith('page-noise') || file === 'slime_page_noise.webp') 
    && file.endsWith('.webp') 
    && !file.includes('-q70'));

async function optimizePageNoise() {
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  console.log('Starting page noise optimization...\n');

  for (const file of pageNoiseFiles) {
    const inputPath = path.join(optimizedDir, file);
    const outputPath = path.join(optimizedDir, file.replace('.webp', '-q70.webp'));

    try {
      await sharp(inputPath)
        .webp(settings)
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size;
      const optimizedSize = fs.statSync(outputPath).size;
      const savings = originalSize - optimizedSize;
      const savingsPercentage = ((savings / originalSize) * 100).toFixed(2);

      totalOriginalSize += originalSize;
      totalOptimizedSize += optimizedSize;
      
      console.log(`Processed ${file}:`);
      console.log(`Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Saved: ${(savings / 1024 / 1024).toFixed(2)}MB (${savingsPercentage}%)`);
      console.log('---');
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  const totalSavings = totalOriginalSize - totalOptimizedSize;
  const totalSavingsPercentage = ((totalSavings / totalOriginalSize) * 100).toFixed(2);

  console.log('\nOptimization Complete!');
  console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)}MB (${totalSavingsPercentage}%)`);
}

optimizePageNoise().catch(console.error); 