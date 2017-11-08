process.env = 'test';

var Jasmine = require('jasmine');
let jasmine = new Jasmine();

jasmine.loadConfig({
    spec_dir: './',
    spec_files: ['**/*.spec.js']
});

jasmine.onComplete(function(passed) {
    if (passed) {
        console.log('Tests passed successfully.');
    }
});

jasmine.execute();