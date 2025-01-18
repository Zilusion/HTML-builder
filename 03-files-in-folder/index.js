const fs = require('fs/promises');
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');
const recursive = process.argv.includes('-r');

readFolder(folderPath);

async function readFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(folderPath, file.name);
        const stats = await fs.stat(filePath);

        const [fileName, fileExtension] = file.name.toString().split('.');
        const size = stats.size;

        console.log(
          `${fileName} - ${fileExtension} - ${
            size % 1024 === 0 ? size / 1024 : (size / 1024).toFixed(3)
          }kb`,
        );
      }

      if (recursive && file.isDirectory()) {
        await readFolder(path.join(folderPath, file.name));
      }
    }
  } catch (err) {
    console.error('Error reading directory:', err.message);
  }
}
