/**
 * Create client template.
 */

const fs = require('fs');
const path = require('path');
const format = require('util').format;

const jsOrder = ['polyfills', 'vendor', 'app'];
const pathPrefix = path.join('angular-app', 'dist');

function removeDuplicates(input) {
    let output = [];

    input.forEach(item => {
        const prefix = item.split('.')[0];

        let present = false;
        for (let i = 0; i < output.length; i++) {
            const prefix2 = output[i].split('.')[0];
            if (prefix === prefix2) {
                present = true;
                break;
            }
        }

        if (!present) {
            output.push(item);
        }
    })

    return output;
}

// Determine CSS files
const cssFiles = removeDuplicates(fs.readdirSync(path.join(pathPrefix, 'css'))
.map(file => {
    return {
        name: file,
        time: fs.statSync(path.join(pathPrefix, 'css', file)).mtime.getTime()
    };
})
.filter(file => file.name.endsWith('.css'))
.sort((file1, file2) => { return file2.time - file1.time; })
.map(file => `/css/${file.name}`));

// Determine JS bundle files
const jsFilesOrig = removeDuplicates(fs.readdirSync(path.join(pathPrefix, 'js'))
.map(file => {
    return {
        name: file,
        time: fs.statSync(path.join(pathPrefix, 'js', file)).mtime.getTime()
    };
})
.filter(file => file.name.endsWith('.js'))
.sort((file1, file2) => { return file2.time - file1.time; })
.map(file => `/js/${file.name}`));

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
