import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

const PHOTOGRAPHY_DIR = path.join(process.cwd(), 'public', 'photography');
const PHOTOS_DATA_FILE = path.join(process.cwd(), 'data', 'photos.ts');

// Function to generate the photos data file content
function generatePhotosData(files: string[]): string {
  const photos = files
    .filter(file => {
      // Filter out non-image files and hidden files
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && !file.startsWith('.');
    })
    .map((file, index) => ({
      src: `/photography/${file}`,
      alt: `Photography ${index + 1}`
    }));

  return `export interface Photo {
  src: string;
  alt: string;
}

const photos: Photo[] = ${JSON.stringify(photos, null, 2)};

export default photos;
`;
}

// Function to update the photos data file
function updatePhotosData() {
  fs.readdir(PHOTOGRAPHY_DIR, (err, files) => {
    if (err) {
      console.error('Error reading photography directory:', err);
      return;
    }

    const content = generatePhotosData(files);
    fs.writeFile(PHOTOS_DATA_FILE, content, 'utf8', (err) => {
      if (err) {
        console.error('Error writing photos data file:', err);
        return;
      }
      console.log('Photos data file updated successfully!');
    });
  });
}

// Watch for changes in the photography directory
const watcher = chokidar.watch(PHOTOGRAPHY_DIR, {
  ignored: /(^|[\/\\])\../, // ignore hidden files
  persistent: true
});

console.log('Watching for changes in photography directory...');

watcher
  .on('add', path => {
    console.log(`File ${path} has been added`);
    updatePhotosData();
  })
  .on('unlink', path => {
    console.log(`File ${path} has been removed`);
    updatePhotosData();
  });

// Initial update
updatePhotosData(); 