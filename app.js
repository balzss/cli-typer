var stdin = process.stdin;

stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );

const text = 'hello szia hi mizu hali hello szia megint';
process.stdout.write(text + '\n\n');
let i = 0;
let wrote = '';
let results = '';

stdin.on( 'data', function( key ){
    // ctrl-c
    if ( key === '\u0003' || i == text.length) {
        process.exit();
    }
    if ( key === '\u007f' ) {
        if( text[i-1] == ' ') return;
        i--;
        wrote = wrote.slice(0, -1);
        results = results.slice(0, -10);
    // } else if (key == ' '){
    //     i++;
    //     wrote = '';
    //     results += ' ';
    } else {
        i++;
        wrote += key;
        results += (key == text[i-1] ? '\x1b[42m' : '\x1b[41m')  + text[i-1] + '\x1b[0m';
    }


    process.stdout.clearLine();
    process.stdout.moveCursor(0, -2);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(results + text.substring(i) + '\n\n' + wrote);
});
