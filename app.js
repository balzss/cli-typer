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

const text = 'hello szia hi mizu hali hello szia megint';

process.stdout.write(text + '\n\n');
let cursor = 0;

// the upper text which shows what to type
let results = '';
// the lower text which show what you typed
let wrote = '';

stdin.on( 'data', key => {
    // exit on ctrl-c or when end of line is reached
    if (key == SPECIAL.CTRL_C || i >= text.length) {
        process.exit();
    }

    if (key == SPECIAL.BACKSPACE) {
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
    stdout.cursorTo(0);
    stdout.write(results + text.substring(cursor) + '\n\n' + wrote);
});
