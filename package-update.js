const fs = require('fs');
const pkg = require('./package.json');

pkg.scripts = {
  "start": "node server.js",
  "dev": "node server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
};

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('Updated package.json');
