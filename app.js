const fs = require('fs');

const stdin = process.stdin;
const stdout = process.stdout;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

function printStats(){
    stdout.clearLine();
    stdout.cursorTo(0);

    console.log(`Time's up!`);
    console.log(`WPM: ${Math.round(stats.corrects/5*(60/CONFIG.givenSeconds))}`);
    console.log(`All keystrokes: ${stats.keypresses}`);
    console.log(`Correct keystrokes: ${stats.corrects}`);
    console.log(`Wrong keystrokes: ${stats.errors}`);
    console.log(`Accuracy: ${Math.round(stats.corrects/stats.keypresses * 10000)/100}%`);
    process.exit();
}

function initConfig(){
    return {
        wordsPerLine: parseInt(argvParser(['-w', '--words'], '9'), 10),
        givenSeconds: parseInt(argvParser(['-t', '--time'], '60'), 10),
        inputFile: argvParser(['-i', '--input'], 'data/mostCommon1000.txt')
    }
}

function argvParser(flags, dflt){
    for(flag of flags){
        if(process.argv.indexOf(flag) != -1) {
            return process.argv[process.argv.indexOf(flag) + 1];
        }
    }
    return dflt;
}

function* lineGenerator(path, k) {
    const words = fs.readFileSync(path, 'utf8').split('\n');
    // shuffle the array (from: https://gist.github.com/guilhermepontes/17ae0cc71fa2b13ea8c20c94c5c35dc4)
    const shuffledWords = words.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
    for(let i = 0; i+k < shuffledWords.length-1; i += k) {
        yield shuffledWords.slice(i, i + k).join(' ');
    }
}

const SPECIAL = {
    CTRL_C: '\u0003',
    BACKSPACE: '\u007f',
    GREEN_BG: '\x1b[42m',
    RED_BG: '\x1b[41m',
    BG_END: '\x1b[0m'
}

const CONFIG = initConfig();

// the upper text which shows what to type
let results = '';
// the lower text which show what you typed
let wrote = '';
let started = false;
let startTime;

let stats = {
    corrects: 0,
    errors: 0,
    keypresses: 0
}

const lineGen = lineGenerator(CONFIG.inputFile, CONFIG.wordsPerLine);

let text = lineGen.next().value;
let nextText = lineGen.next().value;

process.stdout.write(text + '\n' + nextText + '\n\n');
let cursor = 0;

stdin.on('data', key => {
    if(!started) {
        setTimeout(printStats, CONFIG.givenSeconds * 1000);
        startTime = Date.now();
        started = true;
    }

    // exit on ctrl-c
    if (key == SPECIAL.CTRL_C) {
        process.exit();
    }

    // end of current line
    if(cursor >= text.length) {
        text = nextText;
        nextText = lineGen.next().value;
        cursor = 0;
        wrote = '';
        results = '';
    } else if (key == SPECIAL.BACKSPACE) {
        // do nothing on the beginning of the line
        if(cursor == 0) return;
        wrote = wrote.slice(0, -1);
        // the last char with the colored background takes up 10 characters
        results = results.slice(0, -10);
        cursor--;
    } else if(!key.match(/[a-zA-Z0-9\s]/)) {
        return;
    } else {
        wrote += key;

        if(key == text[cursor]){
            results += SPECIAL.GREEN_BG;
            stats.corrects++;
        } else {
            results += SPECIAL.RED_BG;
            stats.errors++;
        }
        results += text[cursor] + SPECIAL.BG_END;
        cursor++;
        stats.keypresses++;
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
