const fs = require('fs');
const path = require('path');

main();

async function main() {
  const srcDir = path.join(__dirname, 'styles');
  const destFile = path.join(__dirname, 'project-dist', 'bundle.css');

  await mergeStyles(srcDir, destFile);
  console.log('Merging styles is complete!');
}

async function mergeStyles(srcDir, destFile) {
  fs.readdir(srcDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err.message);
      return;
    }

    const cssFiles = files.filter(
      (file) => file.isFile() && path.extname(file.name) === '.css',
    );
    const readPromises = cssFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(srcDir, file.name);
        const readableStream = fs.createReadStream(filePath, 'utf-8');
        let fileData = '';

        readableStream.on('data', (chunk) => (fileData += chunk));
        readableStream.on('end', () => resolve(fileData));
        readableStream.on('error', reject);
      });
    });

    Promise.all(readPromises)
      .then((styles) => {
        const bundledStyles = styles.join('\n');
        fs.writeFile(destFile, bundledStyles, (err) => {
          if (err) console.error('Error writing file:', err.message);
          else console.log('Styles successfully bundled into bundle.css!');
        });
      })
      .catch((err) => {
        console.error('Error reading CSS files:', err.message);
      });
  });
}
