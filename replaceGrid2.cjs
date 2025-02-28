const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, searchValue, replaceValue) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const updatedContent = fileContent.replace(searchValue, replaceValue);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
};

const traverseDirectory = (dir, callback) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      traverseDirectory(filePath, callback);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      callback(filePath);
    }
  });
};

const projectRoot = path.resolve(__dirname, 'src');
traverseDirectory(projectRoot, filePath => replaceInFile(filePath, /Grid2/g, 'Grid'));

console.log('Remplacement terminé');
