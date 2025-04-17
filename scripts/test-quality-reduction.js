const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(process.cwd(), 'public', 'images', 'optimized', 'page-noise-dune.webp');
const outputFile = path.join(process.cwd(), 'public', 'images', 'optimized', 'page-noise-dune-q70.webp');

// Test settings
const settings = {
  quality: 70,
  compressionLevel: 9,
};

async function testQualityReduction() {
  try {
    // Process the image
    await sharp(inputFile)
      .webp(settings)
      .toFile(outputFile);

    // Get file sizes
    const originalSize = fs.statSync(inputFile).size;
    const optimizedSize = fs.statSync(outputFile).size;
    const savings = originalSize - optimizedSize;
    const savingsPercentage = ((savings / originalSize) * 100).toFixed(2);
    
    console.log('Quality Reduction Test Results:');
    console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`New size (q70): ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Size reduction: ${(savings / 1024 / 1024).toFixed(2)}MB (${savingsPercentage}%)`);
  } catch (error) {
    console.error('Error during optimization:', error);
  }
}

testQualityReduction().catch(console.error); 