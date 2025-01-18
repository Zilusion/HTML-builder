const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filePath = path.join(__dirname, 'output.txt');
const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

writeStream.on('error', (err) => {
  console.error('Error creating write stream:', err.message);
  process.exit(1);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Hello! Enter text to write to the file. Press Ctrl+C to exit.');

rl.on('line', (input) => {
  if (input.trim().toLowerCase() === 'exit') {
    sayGoodbye();
  } else {
    writeStream.write(`${input}\n`, (err) => {
      if (err) console.error('Ошибка при записи в файл:', err.message);
    });
  }
});

rl.on('SIGINT', sayGoodbye);

function sayGoodbye() {
  console.log('Thank you for using the program. Goodbye!');
  writeStream.end();
  rl.close();
  process.exit(0);
}
