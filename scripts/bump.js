// I would prefer to use plain bash scripts, however I am
// currently using a Windows OS and Git Bash (MINGW) doesn't
// support all the commands found in *nix (CYGWIN).
require('shelljs/global');
var fs = require('fs');

// Get new version
var newVersion = JSON.parse(fs.readFileSync('./package.json')).version;

// Update version key in bower.json
sed('-i', /\ \ "version": "(.*)",/, '  "version": "' + newVersion + '",', 'bower.json');

// Update version tag in docblocks
sed('-i', /\ * @version .*/, ' @version ' + newVersion, 'src/js/Moovie.js');

// Success
exit(0);
