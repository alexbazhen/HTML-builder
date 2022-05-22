const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');

const pathToNewFile = path.resolve('02-write-file', './dear_diary.txt');
const newLineSymbol = process.platform === 'win32' ? '\r\n' : '\n';
const stream = fs.createWriteStream(pathToNewFile);
let startWrite = true;
const chat = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function theEnd() {
  const answer = startWrite ? '\033[31m Даже ничего не написал, ну ладно.. Пока! \x1b[0m' : '\x1b[32m Всё записано в дневник! Пока!\x1b[0m';
  console.log(answer);
  chat.close();
  stream.end();
}
function addString(str) {   
  const newString = startWrite ? str : newLineSymbol + str;
  if (str !== 'exit') {
    stream.write(newString, 'utf-8');
  } else {
    theEnd();
  }
  startWrite = false;
}

chat.question('\x1b[33m Привет, это твой дорогой дневник, что ты хочешь записать? \x1b[0m \n', (answer) => {
  addString(answer);
});
chat.on('line', (input) => {
  addString(input);
});
chat.on('SIGINT', () => {
  theEnd();
});

