const fs = require('fs');
const path = require('path');

const nameFileDest = 'bundle.css';
const folderStyles = path.resolve('05-merge-styles', './styles');
const folderDest = path.resolve('05-merge-styles', './project-dist');
const fileDest = path.join(folderDest, '/', nameFileDest);

fs.access(fileDest, fs.constants.F_OK, (err) => {
  if (err) { 
    console.log('\x1b[32m' + 'Создание и компиляция файла ' + '\x1b[0m' + '\x1b[42m\x1b[30m' + nameFileDest + '\x1b[0m');
    buildCss();
  } else {
    fs.unlink(fileDest, (err) => {
      if (err) throw err;
      console.log('Файл стилей ' + '\x1b[42m\x1b[30m' + nameFileDest + '\x1b[0m' + ' уже существует. ' + '\x1b[32m' + 'Компилирую его снова.' + '\x1b[0m');
      buildCss();
    });
  }
});
function buildCss() {
  const writing = fs.createWriteStream(fileDest);

  fs.readdir(folderStyles, { withFileTypes: true }, (err, files) => {
    if (err) {
      throw err;
    } else {
      files.forEach(file => {
        const fullNameFile = file.name;
        fs.stat(path.join(folderStyles, '/', fullNameFile), (err, stats) => {
          if (err) {
            throw err;
          } else {
            if (stats.isFile()) {
              const extName = path.extname(fullNameFile);
              if (extName == '.css') {
                readFile(path.join(folderStyles, '/', fullNameFile));
              }
            }
          }
        });
      });
    }
  });
  function readFile(file) {
    const reading = fs.createReadStream(file, 'utf-8');
    reading.on('data', function (part) {
      writing.write(part, 'utf-8');
    });
  }
}
