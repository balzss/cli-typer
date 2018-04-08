#!/usr/bin/env node

// show help if at least one of these flags are present
if (process.argv.indexOf('-h') != process.argv.indexOf('--help')) {
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
    GREEN_TEXT: '\x1b[32m',
    RESET: '\x1b[0m'
}

const ALPHANUMERIC = /[\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F]/u;
const ANSI_ESCAPE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

function removeAnsiEscape(text) {
    return text.replace(ANSI_ESCAPE, '');
}

function boxTop(width=79) {
    return '╭' + ('─'.repeat(width-2)) + '╮';
}

function boxText(text, width=79) {
    const spaceAvailable = width-4-removeAnsiEscape(text).length;
    if (spaceAvailable < 0) return '│ ' + text;
    return '│ ' + text + ' '.repeat(spaceAvailable) + ' │';
}

function boxSeparator(width=79) {
    return '├' + ('─'.repeat(width-2)) + '┤';
}

function boxBottom(width=79) {
    return '╰' + ('─'.repeat(width-2)) + '╯';
}

function printStats() {
    console.log('\n' + boxSeparator());
    console.log(boxText(`Time's up!`));
    console.log(boxText(`WPM: ${stats.wpm}`));
    console.log(boxText(`All keystrokes: ${stats.keypresses}`));
    console.log(boxText(`Correct keystrokes: ${stats.corrects}`));
    console.log(boxText(`Wrong keystrokes: ${stats.errors}`));
    console.log(boxText(`Accuracy: ${stats.accuracy}%`));
    console.log(boxBottom());
    process.exit();
}

function initConfig() {
    return {
        wordsPerLine: argvParser(['-w', '--words'], 9, validateIntArg),
        givenSeconds: argvParser(['-t', '--time'], 60, validateIntArg),
        inputFile: argvParser(['-i', '--input'], __dirname + '/data/mostCommon1000.txt'),
        verbose: process.argv.indexOf('-V') != process.argv.indexOf('--verbose'),
        savePath: argvParser(['-s', '--save'], false)
    }
}

function plural(n, noun) {
    const output = `${n} ${noun}`;
    return n !== 1 ? output + 's' : output;
}

function printConfig(config) {
    console.log(boxTop());
    console.log(boxText('Settings'));
    console.log(boxSeparator());
    console.log(boxText(plural(config.givenSeconds, 'second')));
    console.log(boxText(`${plural(config.wordsPerLine, 'word')} per line`));
    console.log(boxText(`Input: ${config.inputFile}`));
    if (config.savePath !== false) console.log(boxText(`Save path: ${config.savePath}`))
    console.log(boxBottom());
}

function printInstructions() {
    console.log(`\n ✅ Start typing the words below:\n`)
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

function saveStats() {

  if (!CONFIG.savePath) return

  date = new Date(startTime).toLocaleString();
  headers = "Date\tLength (seconds)\tWPM\tKeystrokes\tCorrect\tWrong\tAccuracy\tInput\n"
  content = `${date}\t${CONFIG.givenSeconds}\t${stats.wpm}\t${stats.keypresses}\t${stats.corrects}\t${stats.errors}\t${stats.accuracy}\t${CONFIG.inputFile}\n`

  try {
    fs.statSync(CONFIG.savePath).isFile()
    // If the file exists, assume headers have already been written.
    data = content;
  } catch (e) {
    if (e.code === 'ENOENT') {
      // Since the file does not exist, write the headers as well.
      data = headers + content;
    } else {
      throw e;
    }
  }

  fs.appendFileSync(CONFIG.savePath, data, (err) => {if (err) throw err});
}

function calcStats() {
  stats.wpm = Math.round(stats.corrects/5*(60/CONFIG.givenSeconds));
  stats.accuracy = Math.round(stats.corrects/stats.keypresses * 10000)/100;
}

const CONFIG = initConfig();
if (CONFIG.verbose) printConfig(CONFIG);
printInstructions();

// the upper text which shows what to type
let results = '';
// the lower text which shows what you typed
let wrote = '';
let started = false;
let startTime;

let stats = {
    corrects: 0,
    errors: 0,
    keypresses: 0,
    wpm: 0,
    accuracy: 0
}

const lineGen = lineGenerator(CONFIG.inputFile, CONFIG.wordsPerLine);

let text = lineGen.next().value;
let nextText = lineGen.next().value;

process.stdout.write(boxTop() + '\n' + boxText(text) + '\n' + boxText(nextText) + '\n' + boxSeparator() + '\n│ ');
let cursor = 0;

stdin.on('data', key => {
    if (!started) {
        setTimeout(calcStats, CONFIG.givenSeconds * 1000);
        setTimeout(saveStats, CONFIG.givenSeconds * 1000);
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
    } else if (!ALPHANUMERIC.test(key)) {
        // return on non-alphanumeric unicode characters
        // regex generated with: http://kourge.net/projects/regexp-unicode-block
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
        results += text[cursor] + SPECIAL.RESET;
        cursor++;
        stats.keypresses++;
    }

    // erase the whole thing and display the next words to type
    stdout.clearLine();
    stdout.moveCursor(0, -2);
    stdout.clearLine();
    stdout.moveCursor(0, -1);
    stdout.clearLine();
    stdout.cursorTo(0);
    stdout.write(boxText(results + text.substring(cursor)) + '\n' + boxText(nextText) + '\n\n│ ' + wrote);
});
