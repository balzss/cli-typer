const fs = require('fs');

const stdin = process.stdin;
const stdout = process.stdout;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

const SPECIAL = {
    CTRL_C: '\u0003',
    BACKSPACE: '\u007f',
    GREEN_BG: '\x1b[42m',
    RED_BG: '\x1b[41m',
    BG_END: '\x1b[0m'
}

const sampleWordlist = function(path, k) {
    const words = fs.readFileSync(path, 'utf8').split('\n');
    //return _.sample(words, k);  // if we ever wanna use underscore.js
    const randomStart = Math.floor(Math.random() * (words.length - k))
    return words.slice(randomStart, randomStart + k);
}

let text = sampleWordlist('data/mostCommon1000.txt', 6).join(' ')
let nextText = sampleWordlist('data/mostCommon1000.txt', 6).join(' ')

process.stdout.write(text + '\n' + nextText + '\n\n');
let cursor = 0;

// the upper text which shows what to type
let results = '';
// the lower text which show what you typed
let wrote = '';

stdin.on( 'data', key => {
    // exit on ctrl-c
    if (key == SPECIAL.CTRL_C) {
        process.exit();
    }

    // end of current line
    if(cursor >= text.length) {
        text = nextText;
        nextText = sampleWordlist('data/mostCommon1000.txt', 6).join(' ')
        cursor = 0;
        wrote = '';
        results = '';
    } else if (key == SPECIAL.BACKSPACE) {
        // don't delete before the current word
        if(text[cursor-1] == ' ') return;
        cursor--;
        wrote = wrote.slice(0, -1);
        // the last char with the colored background takes up 10 characters
        results = results.slice(0, -10);
    } else {
        cursor++;
        wrote += key;
        results += (key == text[cursor-1] ? SPECIAL.GREEN_BG : SPECIAL.RED_BG)  + text[cursor-1] + SPECIAL.BG_END;
    }


    // erease the whole thing and display the updated version
    stdout.clearLine();
    stdout.moveCursor(0, -2);
    stdout.clearLine();
    stdout.moveCursor(0, -1);
    stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(results + text.substring(cursor) + '\n' + nextText + '\n\n' + wrote);
});
