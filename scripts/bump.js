// I would prefer to use plain bash scripts, however I am
// currently using a Windows OS and Git Bash (MINGW) doesn't
// support all the commands found in *nix (CYGWIN).
const fileSystem = require('fs');
const pkg = fileSystem.readFileSync('./package.json');
const newVersion = JSON.parse(pkg).version;
const sed = require('shelljs').sed;

// Update version key in bower.json
sed('-i', / {2}"version": "(.*)",/, `  "version": "${newVersion}",`, 'bower.json');

// Update version tag in docblocks
sed('-i', / * @version .*/, ` @version ${newVersion}`, 'src/js/texttracks/*.js');
sed('-i', / * @version .*/, ` @version ${newVersion}`, 'src/js/*.js');
sed('-i', / * @version .*/, ` @version ${newVersion}`, 'src/scss/main.scss');
