const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');
// Add Enter Stroke
const newLineSym = process.platform === 'win32' ? '\r\n' : '\n';
// Colors for console
const
  nullSt = '\x1b[0m',
  greenSt = '\x1b[32m',
  greenBgSt = '\x1b[42m\x1b[30m',
  redSt = '\033[31m',
  yellowSt = '\x1b[33m';
// Function join
const join = (parent, child) => path.join(parent, '/', child);
// All Paths
const mainFolder = path.resolve('06-build-page');
const destFolder = join(mainFolder, 'project-dist');
const paths = {
  src: {
    name: '06-build-page',
    src: mainFolder
  },
  dest: {
    name: 'project-dist',
    dest: destFolder
  },
  assets: {
    name: 'assets',
    src: join(mainFolder, 'assets'),
    dest: join(destFolder, 'assets')
  },
  styles: {
    name: 'styles',
    src: join(mainFolder, 'styles'),
    dest: join(destFolder, 'style.css'),
    ext: '.css'
  },
  components: {
    name: 'components',
    src: join(mainFolder, 'components')
  },
  html: {
    name: 'html',
    src: join(mainFolder, 'template.html'),
    dest: join(destFolder, 'index.html'),
    ext: '.html'
  }
};

// Clean Dist Folder
async function cleanFolder(dir) {
  const pathDir = dir.dest;
  try {
    await fsPromise.access(pathDir);
  } catch (error) {
    console.log(`Папка ${greenBgSt} ${dir.name} ${nullSt} не существует, очистки не требуется`);
    return;
  }
  await fsPromise.rm(pathDir, { recursive: true });
  console.log(`${greenBgSt} Очистка папки ${dir.name} произведена ${nullSt} \n`);
}

// Create Dist Folder
async function createFolder(dir, parentDir) {
  const parent = parentDir ? parentDir.name + '/' : '/';
  await fsPromise.mkdir(dir.dest, { recursive: true });
  console.log(`${greenSt} Создана папка ${greenBgSt} ${parent}${dir.name} ${nullSt}`);
}

// AllCopy from direction to direction
async function copyFolder(dir, parentDir) {
  const parent = parentDir ? parentDir.name + '/' : '/';
  const folder = dir.src;
  const outFolder = dir.dest;
  const files = await fsPromise.readdir(folder, { withFileTypes: true });
  await Promise.all(files.map(async (file) => {
    const fileName = file.name;
    const filePaths = {
      name: fileName,
      src: join(folder, fileName),
      dest: join(outFolder, fileName)
    };
    const stats = await fsPromise.stat(filePaths.src);
    if (stats.isDirectory()) {
      await createFolder(filePaths, dir);
      await copyFolder(filePaths, dir);
    } else {
      await copyOneFile(filePaths.src, filePaths.dest);
    }
  }));
  console.log(`${greenSt}  Папка ${greenBgSt} ${parent}${dir.name} ${nullSt} ${greenSt}скопирована ${nullSt}`);
}
function copyOneFile(src, dest) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(src);
    readStream.on('error', (err) => {
      if (err) return reject(err);
    });
    const writeStream = fs.createWriteStream(dest);
    writeStream.on('error', (err) => {
      if (err) return reject(err);
    });
    writeStream.on('close', (err) => {
      if (err) return reject(err);
    });
    readStream.pipe(writeStream);

    writeStream.on('finish', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Build style.css
async function buildStyle(style) {
  const srcDirPath = style.src;
  const outFilePath = style.dest;
  const writing = fs.createWriteStream(outFilePath);
  const allCss = [''];
  function readStyle(file, first) {
    return new Promise((resolve, reject) => {
      const reading = fs.createReadStream(file, 'utf-8');
      reading.on('error', (err) => {
        if (err) return reject(err);
      });
      reading.on('data', (part) => {
        first ? allCss[0] = part : allCss.push(part);
      });
      reading.on('end', () => {
        allCss[allCss.length - 1] = allCss[allCss.length - 1] + newLineSym;
        resolve();
      });
    });
  }
  try {
    const files = await fsPromise.readdir(srcDirPath, { withFileTypes: true });
    await Promise.all(files.map(async (file) => {
      const fileName = file.name;
      const filePaths = {
        name: fileName,
        src: join(srcDirPath, fileName)
      };
      const stats = await fsPromise.stat(filePaths.src);
      if (stats.isFile()) {
        const extName = path.extname(fileName);
        if (extName == style.ext) {
          await readStyle(filePaths.src, fileName == 'header.css' ? true : false);
        }
      }
    }));
    writing.write(allCss.join(''), 'utf-8');
    console.log(`\n--- ${greenSt}Сборка${nullSt} ${greenBgSt} style.css ${nullSt} ${greenSt} успешно завершена${nullSt} ---\n`);
  } catch (err) {
    console.log(`\n--- ${redSt}Ошибка при сборке style.css${nullSt} ---\n`);
  }
}

// Build html
async function buildHtml(html) {
  const srcFilePath = html.src;
  const outFilePath = html.dest;
  await copyOneFile(srcFilePath, outFilePath);
  console.log(`--- ${greenSt}Создан ${nullSt}${greenBgSt} ${path.basename(outFilePath)} ${nullSt}${greenSt} из ${path.basename(srcFilePath)} ${nullSt}---\n`);
  const resultHtml = await checkComponents(outFilePath);
  await writeHtml(outFilePath, resultHtml);
  console.log(`\n--- ${greenSt}Закончена обработка ${greenBgSt} ${path.basename(paths.html.dest)} ${nullSt} ---`);
  
}
function writeHtml(outFilePath, resultHtml) {
  return new Promise((resolve, reject) => {
    const writing = fs.createWriteStream(outFilePath, 'utf-8');
    writing.on('error', (err) => {
      if (err) return reject(err);
    });
    writing.write(resultHtml.join(''), 'utf-8', (err) => {
      if (err) throw err;
      resolve();
    });
  });
}
function checkComponents(outHtml) {
  return new Promise((resolve, reject) => {
    console.log(`${yellowSt}--- Проверка ${path.basename(paths.html.dest)} на наличие компонентов ---${nullSt}`);
    let allHtml = [];
    const
      startSymb = '{{',
      endSymb = '}}';
    const reading = fs.createReadStream(outHtml, 'utf-8');
    reading.on('error', (err) => {
      if (err) return reject(err);
    });
    reading.on('data', (chunk) => {
      allHtml.push(chunk);
    });
    reading.on('end', async () => {
      const resultHtml = await Promise.all(allHtml.map(async (stroke) => {
        if (stroke.includes(startSymb) && stroke.includes(endSymb)) {
          let str = stroke;
          let allComponents = await findInHtml(str, startSymb, endSymb);
          const listComponents = allComponents.join(' | ');
          console.log(`\nВ ${path.basename(paths.html.dest)} были обнаружены следующие компоненты: \n${yellowSt} ${listComponents} ${nullSt}\n`);
          console.log(`${yellowSt}Поиск шаблонов для компонентов...${nullSt}`);
          await Promise.all(allComponents.map(async (component) => {
            const nameComponent = component.toLowerCase().replace(/[^a-z]/gi, '');
            const srcComponent = path.join(paths.components.src, '/', nameComponent + paths.html.ext);
            try {
              await fsPromise.access(srcComponent);
              console.log(`${greenSt}- Шаблон для компонента ${component} найден${nullSt}`);
            } catch (error) {
              const fileName = path.join(paths.components.name, '/', nameComponent + paths.html.ext);
              console.log(`${redSt}- Шаблон ${fileName} для компонента ${component} не найден, удаление фрагмента ${component} из HTML${nullSt}`);
              str = str.replace(component, '');
              return;
            }
            const newChunk = await getComponentHtml(srcComponent);
            const newStr = newChunk.join('');
            str = str.replace(component, newStr);
          }));
          console.log(`\n--- ${greenSt}Все компоненты получены, компиляция ${path.basename(paths.html.dest)}${nullSt} ---`);
          return str;
        } else {
          console.log(`\n--- Компоненты в ${path.basename(paths.html.dest)} не обнаружены. ${path.basename(paths.html.dest)} остается без изменений. ---`);
          return stroke;
        }
      }));
      return resolve(resultHtml);
    });
  });
}
function findInHtml(str, startSymb, endSymb) {
  return new Promise((resolve, reject) => {
    let result = [];
    let isComponents = true;
    let indexStart = 0;
    let maxCycle = 0;
    while (isComponents == true || maxCycle <= 100) {
      if (str.includes(startSymb, indexStart) && str.includes(endSymb, indexStart)) {
        indexStart = str.indexOf(startSymb, indexStart);
        let indexEnd = str.indexOf(endSymb, indexStart) + 2;
        let newSubStr = str.slice(indexStart, indexEnd);
        result.push(newSubStr);
        indexStart = indexEnd + 1;
        maxCycle++;
        if (maxCycle == 100) {
          return reject(result);
        }
      } else {
        isComponents = false;
        return resolve(result);
      }
    }
  });
}
function getComponentHtml(src) {
  return new Promise((resolve, reject) => {
    let result = [];
    const reading = fs.createReadStream(src);
    reading.on('error', (err) => {
      if (err) return reject(err);
    });
    reading.on('data', (chunk) => {
      result.push(chunk);
    });
    reading.on('end', () => {
      return resolve(result);
    });
  });
}

// Main Stream
async function build() {
  const start = new Date().getTime();
  console.log(`\n--- ${greenBgSt} Запущен процесс компиляции ${nullSt} --- \n`);
  await cleanFolder(paths.dest);
  await createFolder(paths.dest);
  await createFolder(paths.assets, paths.dest);
  await copyFolder(paths.assets);
  await buildStyle(paths.styles);
  await buildHtml(paths.html);
  const end = new Date().getTime();
  const timeOnBuild = end - start;
  console.log(`\n--- ${greenBgSt} Компиляция завершена за ${timeOnBuild}ms ${nullSt} ---`);
}
build();

