#!/usr/bin/env node

function flagExists(shortFlag, longFlag) {
    return process.argv.indexOf(`-${shortFlag}`) !== process.argv.indexOf(`--${longFlag}`);
}

// Show help if at least one of these flags are present
if (flagExists('h', 'help')) {
    console.log('Usage:');
    console.log('  cli-typer [options]');
    console.log('\nOptions:');
    console.log('  -t, --time\t\tGiven time in seconds to complete the test');
    console.log('  -w, --words\t\tNumber of words to display per line');
    console.log('  -i, --input\t\tPath to a wordlist file with new line separated words');
    console.log('  -V, --verbose\t\tShow settings on start');
    console.log('  -s, --save\t\tPath to file for saving results');
    console.log('  -h, --help\t\tShow help');
    process.exit();
}

const CONFIG = initConfig();

const stdin = process.stdin;
const stdout = process.stdout;
const fs = require('fs');

const SPECIAL = {
    CTRL_C: '\u0003',
    BACKSPACE: '\u007f',
    GREEN_BG: '\x1b[42m',
    RED_BG: '\x1b[41m',
    GREEN_TEXT: '\x1b[32m',
    RESET: '\x1b[0m'
};

const ALPHANUMERIC = /[\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F]/u;
const ANSI_ESCAPE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

const lineGen = lineGenerator(CONFIG.inputFile, CONFIG.wordsPerLine);

let text, nextText, cursor;

function init(){
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    if (CONFIG.verbose) {
        printConfig(CONFIG);
    }
    console.log('\n  Start typing the words below:\n');

    text = lineGen.next().value;
    nextText = lineGen.next().value;

    process.stdout.write(boxTop() + '\n' + boxText(text) + '\n' + boxText(nextText) + '\n' + boxSeparator() + '\n│ ');
    cursor = 0;
}

function removeAnsiEscape(text) {
    return text.replace(ANSI_ESCAPE, '');
}

function timePad(time) {
    return ('00' + time).slice(-2);
}

function calcRemainingTime(){
    let allSeconds = CONFIG.givenSeconds - Math.round((Date.now() - startTime)/1000);
    let minutes = Math.floor(allSeconds / 60);
    let seconds = allSeconds % 60;
    return timePad(minutes) + ':' + timePad(seconds);
}

// TODO maybe merge box functions to one
function boxTop(width=79) {
    return '╭' + '─'.repeat(width-14) + '┨ ' + calcRemainingTime() + ' ┠───╮';
}

function boxText(text, width=79) {
    const spaceAvailable = width-4-removeAnsiEscape(text).length;
    if (spaceAvailable < 0) {
        return '│ ' + text;
    }
    return '│ ' + text + ' '.repeat(spaceAvailable) + ' │';
}

function boxSeparator(width=79) {
    return '├' + '─'.repeat(width-2) + '┤';
}

function boxBottom(width=79) {
    return '╰' + '─'.repeat(width-2) + '╯';
}

function drawBox() {
    if (boxDrawIsLocked) {
        return;
    }
    boxDrawIsLocked = true;

    // Erase the whole thing and display the next words to type
    stdout.clearLine();
    stdout.moveCursor(0, -2);
    stdout.clearLine();
    stdout.moveCursor(0, -1);
    stdout.clearLine();
    stdout.moveCursor(0, -1);
    stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(boxTop() + '\n' + boxText(results + text.substring(cursor)) + '\n' + boxText(nextText) + '\n\n│ ' + wrote);

    boxDrawIsLocked = false;
}

function printStats() {
    STATS.wpm = Math.round(STATS.corrects/5*(60/CONFIG.givenSeconds));
    STATS.accuracy = Math.round(STATS.corrects/STATS.keypresses * 10000)/100;
    if (CONFIG.savePath) {
        saveStats(STATS, CONFIG);
    }

    console.log(' '.repeat(79 - 3 - wrote.length) + '│\n' + boxSeparator());
    console.log(boxText('Time\'s up!'));
    console.log(boxText(`WPM: ${STATS.wpm}`));
    console.log(boxText(`All keystrokes: ${STATS.keypresses}`));
    console.log(boxText(`Correct keystrokes: ${STATS.corrects}`));
    console.log(boxText(`Wrong keystrokes: ${STATS.errors}`));
    console.log(boxText(`Accuracy: ${STATS.accuracy}%`));
    console.log(boxBottom());
    process.exit();
}

function initConfig() {
    return {
        wordsPerLine: argvParser(['-w', '--words'], 9, validateIntArg),
        givenSeconds: argvParser(['-t', '--time'], 60, validateIntArg),
        inputFile: argvParser(['-i', '--input'], __dirname + '/data/mostCommon1000.txt'),
        verbose: flagExists('V', 'verbose'),
        debug: flagExists('d', 'debug'),
        savePath: argvParser(['-s', '--save'], false)
    };
}

function plural(times, noun) {
    const output = `${times} ${noun}`;
    return times !== 1 ? output + 's' : output;
}

function printConfig(config) {
    console.log(boxTop());
    console.log(boxText('Settings'));
    console.log(boxSeparator());
    console.log(boxText(plural(config.givenSeconds, 'second')));
    console.log(boxText(`${plural(config.wordsPerLine, 'word')} per line`));
    console.log(boxText(`Input: ${config.inputFile}`));
    if (config.savePath !== false) {
        console.log(boxText(`Save path: ${config.savePath}`));
    }
    console.log(boxBottom());
}

function validateIntArg(flags, arg) {
    const intArg = parseInt(arg, 10);
    if (isNaN(intArg)) {
        console.log(`"${arg}"\n${flags.join(', ')} arg should be a whole number.\n`);
        return false;
    }
    if (intArg < 1) {
        console.log(`${flags.join(', ')} must be higher than 0. Set to default.\n`);
        return false;
    }
    return intArg;
}

function argvParser(flags, dflt, validateFunction=false) {
    for (let flag of flags) {
        if (process.argv.indexOf(flag) !== -1) {
            const param = process.argv[process.argv.indexOf(flag) + 1];
            if (!validateFunction) {
                return param;
            }
            const validatedParam = validateFunction(flags, param);
            if (!validatedParam) {
                break;
            }
            return validatedParam;
        }
    }
    return dflt;
}

function random(min, max) {
    if (max === null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle(obj) {
    let sample = obj.slice();
    const last = sample.length - 1;
    for (let index = 0; index < sample.length; index++) {
        let rand = random(index, last);
        let temp = sample[index];
        sample[index] = sample[rand];
        sample[rand] = temp;
    }
    return sample.slice();
}

function *lineGenerator(path, numberOfWords) {
    const words = fs.readFileSync(path, 'utf8').split('\n');
    const shuffledWords = shuffle(words);
    for (let i = 0; i+numberOfWords < shuffledWords.length-1; i += numberOfWords) {
        yield shuffledWords.slice(i, i + numberOfWords).join(' ');
    }
}

// TODO tidy up
function saveStats(stats, config) {
    const date = new Date(startTime).toLocaleString();
    const headers = 'Date\tLength (seconds)\tWPM\tKeystrokes\tCorrect\tWrong\tAccuracy\tInput\n';
    const content = [date, config.givenSeconds, stats.wpm, stats.keypresses, stats.corrects,
        stats.errors, stats.accuracy, config.inputFile].join('\t') + '\n';

    let data;
    try {
        fs.statSync(config.savePath).isFile();
        // If the file exists, assume headers have already been written
        data = content;
    } catch (exception) {
        if (exception.code === 'ENOENT') {
            // Since the file does not exist, write the headers as well
            data = headers + content;
        } else {
            throw exception;
        }
    }

    fs.appendFileSync(config.savePath, data, err => {
        if (err) {
            throw err;
        }
    });
}

function start() {
    setTimeout(printStats, CONFIG.givenSeconds * 1000);
    setInterval(drawBox, 250);
    startTime = Date.now();
    started = true;
}


// The upper text which shows what to type
let results = '';
let interResults = '';
// The lower text which shows what you typed
let wrote = '';
let started = false;
let startTime = Date.now();
let boxDrawIsLocked = false;

// TODO explicit code / variable name standards
let STATS = {
    corrects: 0,
    errors: 0,
    keypresses: 0,
    wpm: 0,
    accuracy: 0
};

init();

// Skip waiting for the first char on debug
if (CONFIG.debug) {
    start();
}

stdin.on('data', key => {
    if (!started) {
        start();
    }

    // Exit on ctrl-c
    if (key === SPECIAL.CTRL_C) {
        process.exit();
    } else if (key === SPECIAL.BACKSPACE) {
        // Do nothing on the beginning of the line
        if (cursor === 0) {return;}

        // Remove error from stats for a more fair calculation
        if (interResults.slice(-1) === 'x'){
            STATS.errors--;
        } else {
            STATS.corrects--;
        }
        STATS.keypresses--;

        wrote = wrote.slice(0, -1);
        interResults = interResults.slice(0, -1);
        // The last char with the colored background takes up 10 characters
        results = results.slice(0, -10);
        cursor--;
    } else if (cursor >= text.length) {
        text = nextText;
        nextText = lineGen.next().value;
        cursor = 0;
        wrote = '';
        results = '';
    } else if (!ALPHANUMERIC.test(key)) {
        // Return on non-alphanumeric unicode characters
        // Regex generated with: http://kourge.net/projects/regexp-unicode-block
        return;
    } else {
        wrote += key;

        if (key === text[cursor]) {
            interResults += 'o';
            results += SPECIAL.GREEN_BG;
            STATS.corrects++;
        } else {
            interResults += 'x';
            results += SPECIAL.RED_BG;
            STATS.errors++;
        }
        results += text[cursor] + SPECIAL.RESET;
        cursor++;
        STATS.keypresses++;
    }

    drawBox();
});
