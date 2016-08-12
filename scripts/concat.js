// I would prefer to use plain bash scripts, however I am
// currently using a Windows OS and Git Bash (MINGW) doesn't
// support all the commands found in *nix (CYGWIN).
require('shelljs/global');

// exit upon first error
set('-e');

// Clean & copy...
rm('-rf', 'dist/*');

// texttracks
touch('dist/texttracks.js');
ls('src/js/texttracks/*.js').forEach(function (file) {
    cat(file).toEnd('dist/texttracks.js');  // Add file to main script
    echo('\n').toEnd('dist/texttracks.js'); // Append newline
});

// Moovie
cp('src/js/Moovie.js', 'dist/moovie.js');
ls('src/js/Moovie.*.js').forEach(function (file) {
    echo('\n').toEnd('dist/moovie.js'); // Append newline
    cat(file).toEnd('dist/moovie.js');  // Add file to main script
});

// combine scripts
cat('dist/moovie.js').toEnd('dist/texttracks.js');
rm('dist/moovie.js');
mv('dist/texttracks.js', 'dist/moovie.js');
