#!/usr/bin/env node

// show help if at least one of these flags are present
if (process.argv.indexOf('-h') != process.argv.indexOf('--help')) {
    console.log('Usage:');
    console.log('  cli-typer [options]');
    console.log('\nOptions:');
    console.log('  -t, --time\t\tGiven time in seconds to complete the test');
    console.log('  -w, --words\t\tNumber of words to display per line');
    console.log('  -i, --input\t\tPath to a wordlist file with new line separated words');
    console.log('  -h, --help\t\tShow help');
    process.exit();
}

const fs = require('fs');

const stdin = process.stdin;
const stdout = process.stdout;

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

function printStats() {
    console.log('\n├' + ('─'.repeat(78)) + '');
    console.log(`│ Time's up!`);
    console.log(`│ WPM: ${Math.round(stats.corrects/5*(60/CONFIG.givenSeconds))}`);
    console.log(`│ All keystrokes: ${stats.keypresses}`);
    console.log(`│ Correct keystrokes: ${stats.corrects}`);
    console.log(`│ Wrong keystrokes: ${stats.errors}`);
    console.log(`│ Accuracy: ${Math.round(stats.corrects/stats.keypresses * 10000)/100}%`);
    console.log('└' + ('─'.repeat(78)) + '');
    process.exit();
}

function initConfig() {
    return {
        wordsPerLine: argvParser(['-w', '--words'], 9, validateIntArg),
        givenSeconds: argvParser(['-t', '--time'], 60, validateIntArg),
        inputFile: argvParser(['-i', '--input'], __dirname + '/data/mostCommon1000.txt')
    }
}

function validateIntArg(flags, arg) {
    const intArg = parseInt(arg, 10);
    if (isNaN(intArg)) {
        console.log(`"${arg}"\nyou're stupid boi/gurl!!!\n`);
        return false;
    }
    if (intArg < 1) {
        console.log(`${flags.join(', ')} must be higher than 0. Set to default.\n`)
        return false;
    }
    return intArg;
}

function argvParser(flags, dflt, validateFunction=false) {
    for (flag of flags) {
        if (process.argv.indexOf(flag) != -1) {
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
    if (max == null) {
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

function* lineGenerator(path, k) {
    const words = fs.readFileSync(path, 'utf8').split('\n');
    const shuffledWords = shuffle(words);
    for (let i = 0; i+k < shuffledWords.length-1; i += k) {
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

process.stdout.write('┌' + ('─'.repeat(78)) + '\n│ ' + text + '\n│ ' + nextText + '\n├' + ('─'.repeat(78)) + '\n│ ');
let cursor = 0;

stdin.on('data', key => {
    if (!started) {
        setTimeout(printStats, CONFIG.givenSeconds * 1000);
        startTime = Date.now();
        started = true;
    }

    // exit on ctrl-c
    if (key == SPECIAL.CTRL_C) {
        process.exit();
    } else if (key == SPECIAL.BACKSPACE) {
        // do nothing on the beginning of the line
        if (cursor == 0) return;
        wrote = wrote.slice(0, -1);
        // the last char with the colored background takes up 10 characters
        results = results.slice(0, -10);
        cursor--;
    } else if (cursor >= text.length) {
        text = nextText;
        nextText = lineGen.next().value;
        cursor = 0;
        wrote = '';
        results = '';
    } else if (!key.match(/[a-zA-Z0-9\s]/)) {
        // return on non alphanumeric keys
        return;
    } else {
        wrote += key;

        if (key == text[cursor]) {
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
    stdout.write('│ ' + results + text.substring(cursor) + '\n│ ' + nextText + '\n\n│ ' + wrote);
});
