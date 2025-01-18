const fs = require('fs');
const path = require('path');

main();

async function main() {
  const srcDir = path.join(__dirname, 'files');
  const destDir = path.join(__dirname, 'files-copy');

  await copy(srcDir, destDir);
  console.log('Copying is complete!');
}

async function copy(srcDir, destDir) {
  try {
    await fs.promises.rm(destDir, { recursive: true, force: true });
  } catch (err) {
    console.error('Error deleting destination folder:', err.message);
  }

  try {
    await fs.promises.mkdir(destDir, { recursive: true });

    const entries = await fs.promises.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        await copy(srcPath, destPath);
      } else if (entry.isFile()) {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.error('Error copying directory:', err.message);
  }
}
