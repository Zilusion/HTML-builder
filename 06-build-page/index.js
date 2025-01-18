const fs = require('fs');
const path = require('path');

main();

async function main() {
  await copy(
    path.join(__dirname, 'assets'),
    path.join(__dirname, 'project-dist/assets'),
  );
  console.log('Copying is complete!');

  await buildHtml(
    path.join(__dirname, 'template.html'),
    path.join(__dirname, 'components'),
    path.join(__dirname, 'project-dist/index.html'),
  );
  console.log('Building HTML is complete!');

  await mergeStyles(
    path.join(__dirname, 'styles'),
    path.join(__dirname, 'project-dist/style.css'),
  );
  console.log('Merging styles is complete!');
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

async function buildHtml(templatePath, componentsDir, outputFile) {
  try {
    let templateContent = await fs.promises.readFile(templatePath, 'utf-8');

    const tagRegex = /{{\s*(\w+)\s*}}/g;
    let match;

    while ((match = tagRegex.exec(templateContent)) !== null) {
      const tagName = match[1];
      const componentPath = path.join(componentsDir, `${tagName}.html`);

      try {
        const componentContent = await fs.promises.readFile(
          componentPath,
          'utf-8',
        );
        templateContent = templateContent.replace(match[0], componentContent);
      } catch (err) {
        console.error(`Component file "${tagName}.html" not found.`);
      }
    }

    await fs.promises.writeFile(outputFile, templateContent);
  } catch (err) {
    console.error('Error building HTML:', err.message);
  }
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
        });
      })
      .catch((err) => {
        console.error('Error reading CSS files:', err.message);
      });
  });
}
