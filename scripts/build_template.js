/**
 * Create client template.
 */

const fs = require('fs');
const path = require('path');
const format = require('util').format;

const jsOrder = ['polyfills', 'vendor', 'app'];

// Determine CSS files
const cssFiles = fs.readdirSync(path.join('public', 'css')).filter(file =>
    file.endsWith('.css')
).map(file => `/css/${file}`);

// Determine JS bundle files
const jsFilesOrig = fs.readdirSync(path.join('public', 'js')).filter(file =>
    file.endsWith('.js')
).map(file => `/js/${file}`);

// Correct order for js files
const jsFiles = [];
for (let i = 0; i < jsOrder.length; i++) {
    for (let j = 0; j < jsFilesOrig.length; j++) {
        if (jsFilesOrig[j].indexOf(jsOrder[i]) > -1) {
            jsFiles.push(jsFilesOrig[j]);
        }
    }
}

const buildFiles = [].concat(cssFiles).concat(jsFiles);

const template = [
    'extends layout',
    '',
    'block content'
];

let index = 0;
if (cssFiles.length) {
    index++;
    template.push(format('  link(rel="stylesheet" href="%s")', buildFiles[0]));
}

template.push('  <dng-app>Loading...</dng-app>');

for (let i = index; i < index + 3; i++) {
    template.push(format('  script(type="text/javascript" src="%s")', buildFiles[i]));
}

fs.writeFile(path.join('views', 'index.pug'), template.join('\n'));
