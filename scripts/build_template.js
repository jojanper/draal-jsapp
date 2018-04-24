/**
 * Create client template.
 */
const fs = require('fs');
const path = require('path');
const format = require('util').format;
const htmlparser = require("htmlparser2");


/**
 * Base class for serializing parsed HTML elements.
 */
class BaseHtmlElementSerializer {
    static create(name, attr, content) {
        const Cls = (name === 'dng-app') ? DngAppSerializer : this;
        return new Cls(name, attr, content);
    }

    constructor(name, attr, content) {
        this.name = name;
        this.attr = attr;
        this.content = content;
    }

    serialize() {
        // Name of element
        let html = format('%s(', this.name);

        // Element attributes
        for (const attr in this.attr) {
            html = format('%s%s=\'%s\' ', html, attr, this.attr[attr]);
        }

        // Element content
        if (this.content) {
            html = format('%s\'%s\'', html, this.content);
        }

        // Close element
        html += ')';

        return html;
    }
}

/**
 * Serialize dng-app element.
 */
class DngAppSerializer extends BaseHtmlElementSerializer {
    constructor(name, attr, content) {
        super(name, attr, content);
    }

    serialize() {
        return format('<%s>%s</%s>', this.name, this.content, this.name);
    }
}

/**
 * Store target element data.
 */
class HtmlData {
    constructor() {
        this.name = '';
        this.attr = '';
        this.data = [];
    }

    setParentTag(tag, attr) {
        this.name = tag;
        this.attr = attr;
    }

    setData(tag, attr) {
        const data = {};
        data.tag = tag;
        data.attr = attr;
        this.data.push(data);
    }

    setContent(content) {
        const index = this.data.length - 1;
        this.data[index].content = content;
    }
}

// Parse these elements from frontend template
const parseTags = ['head', 'body'];

// And save the parsed data here (array of HtmlData items)
const parsedData = [];

// Final template data for backend
const template = [
    'extends layout',
    ''
];


let targetIndex = 0;
let currentObj = null;

const parser = new htmlparser.Parser({
	onopentag: (name, attribs) => {
        // Append element to current object
        if (currentObj) {
            currentObj.setData(name, attribs);
        } else if (targetIndex < parseTags.length && parseTags[targetIndex] === name) {
            // Create new object for storing the parsed data
            currentObj = new HtmlData();
            currentObj.setParentTag(name, attribs);
        }
    },
	ontext: (text) => {
        currentObj.setContent(text);
    },
	onclosetag: (tagname) => {
        // Finished parsing the target element
        if (parseTags[targetIndex] === tagname) {
            targetIndex++;
            parsedData.push(currentObj);
            currentObj = null;
        }
    },
    onend: () => {
        // Serialize the data for each target element
        for (const item of parsedData) {
            template.push(`block ${item.name}`);
            for (const child of item.data) {
                const obj = BaseHtmlElementSerializer.create(child.tag, child.attr, child.content);
                template.push(`  ${obj.serialize()}`);
            }
        }

        // Write the template
        fs.writeFile(path.join('views', 'index.pug'), template.join('\n'), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    }
}, {decodeEntities: true});

// Read the frontend template and parse the data
const filepath = path.join('public', 'frontend', 'index.html');
fs.readFile(filepath, (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    // Pass data to HTML parser
    parser.write(data.toString());
    parser.end();
});
