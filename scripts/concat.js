// I would prefer to use plain bash scripts, however I am
// currently using a Windows OS and Git Bash (MINGW) doesn't
// support all the commands found in *nix (CYGWIN).
require('shelljs/global');

// Clean & copy...
rm('-rf', 'dist/*');
cp('src/js/Moovie.js', 'dist/moovie.js');

// Concatonate files together...
ls('src/js/Moovie.*.js').forEach(function (file) {
    echo('\n').toEnd('dist/moovie.js'); // Append newline
    cat(file).toEnd('dist/moovie.js');  // Add file to main script
});

exit(0);
