import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const sourceDir = './public/images';
const targetDir = './public/images/optimized';

async function convertToWebP() {
  try {
    // Ensure target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Get all PNG files
    const files = await fs.readdir(sourceDir);
    const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));

    for (const file of pngFiles) {
      const inputPath = path.join(sourceDir, file);
      const outputPath = path.join(targetDir, file.replace('.png', '.webp'));

      console.log(`Converting ${file} to WebP...`);

      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);

      console.log(`Successfully converted ${file} to WebP`);
    }

    console.log('All conversions complete!');
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

convertToWebP(); 