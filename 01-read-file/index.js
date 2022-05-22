const fs = require('fs');
const path = require('path');
const pathToFile = path.resolve('01-read-file', './text.txt');
const stream = fs.createReadStream(pathToFile, 'utf-8');
stream.on('data', function(text) {
  console.log(text);
});
