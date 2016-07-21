// I would prefer to use plain bash scripts, however I am
// currently using a Windows OS and Git Bash (MINGW) doesn't
// support all the commands found in *nix (CYGWIN).
require('shelljs/global');

// Clean & copy...
rm('-rf', 'dist/*');                    // Clean distribution directory
cp('src/**/*', 'dist/');                // Copy files to distribution directory
mv('dist/Moovie.js', 'dist/moovie.js'); // rename to lowercase

// Concatonation...
ls('dist/Moovie.*.js').forEach(function (file) {
    echo('\n').toEnd('dist/moovie.js'); // Append newline
    cat(file).toEnd('dist/moovie.js');  // Add file to main script
    rm(file);                           // Delete file after concatonation
});

exit(0);
