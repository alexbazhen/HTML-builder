const fs = require('fs');
const path = require('path');
let startNumberFile = 1;
const pathToFolder = path.resolve('03-files-in-folder', './secret-folder');
fs.readdir(pathToFolder, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.log('Ошибка ', err);
  } else {
    console.log('\x1b[42m\x1b[30m' + '\n Файлы в секретной папке: \n' + '\x1b[0m');
    files.forEach(file => {
      const fullNameFile = file.name;
      fs.stat(path.join(pathToFolder, '/', fullNameFile), (err, stats) => {
        if (err) {
          console.log('Ошибка ', err);
        } else {
          if (stats.isFile()) {
            const extNameIn = path.extname(fullNameFile);
            const nameOut = '\x1b[32m' + path.basename(fullNameFile, extNameIn) + '\x1b[0m';
            const extNameOut = '\x1b[33m' + extNameIn.replace(/[^A-Za-zА-Яа-яЁё]/g, '') + '\x1b[0m';
            const sizeFileInBytes = stats.size;
            const sizeFileOut = sizeFileInBytes / 1024 + '\033[31mkb\x1b[0m';
            const infoFile = startNumberFile + '. ' + nameOut + ' - ' + extNameOut + ' - ' + sizeFileOut;
            console.log(infoFile);
            startNumberFile++;
          }
        }
      });
    });
  }
});