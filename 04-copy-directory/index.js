const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');

// Function join
const join = (parent, child) => path.join(parent, '/', child);

// Colors for console
const
  nullSt = '\x1b[0m',
  greenSt = '\x1b[32m',
  greenBgSt = '\x1b[42m\x1b[30m';

// All Paths
const paths = {
  folder: {
    name: 'files',
    src: path.resolve('04-copy-directory', './files'), // From
    dest: path.resolve('04-copy-directory', './files-copy') // To
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
  console.log(`${greenBgSt} Очистка папки ${path.basename(dir.dest)} произведена ${nullSt} \n`);
}

// Create Dist Folder
async function createFolder(dir, parentDir) {
  const parent = parentDir ? parentDir.name + '/' : '/';
  await fsPromise.mkdir(dir.dest, { recursive: true });
  console.log(`${greenSt} Создана папка ${greenBgSt} ${parent}${path.basename(dir.dest)} ${nullSt}`);
}

// Copy Folder
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
  console.log(`${greenSt}  Папка ${greenBgSt} ${parent}${path.basename(dir.src)} ${nullSt} ${greenSt}скопирована в папку ${greenBgSt} ${path.basename(dir.dest)} ${nullSt}`);
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

// Copy Files
async function copyFiles() {
  const start = new Date().getTime();
  console.log(`\n--- ${greenBgSt} Копирование запущено ${nullSt} --- \n`);
  await cleanFolder(paths.folder);
  await createFolder(paths.folder);
  await copyFolder(paths.folder);
  const end = new Date().getTime();
  const timeOnBuild = end - start;
  console.log(`\n--- ${greenBgSt} Копирование выполнено за ${timeOnBuild}ms ${nullSt} ---`);
}
copyFiles();