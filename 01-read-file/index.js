const fs = require('fs');
const path = require('path');

const pathToFile = path.join(__dirname, 'text.txt');
const readableStream = fs.createReadStream(pathToFile, 'utf-8');

readableStream.pipe(process.stdout);

readableStream.on('error', (error) => console.error('Error:', error.message));
