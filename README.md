Practice touch typing in the commandline and measure your skills.
Coauthored by [qwhex](https://github.com/qwhex).

![cli-typer demo gif](https://raw.githubusercontent.com/balzss/cli-typer/master/demo.gif)

## Install
```
npm install -g balzss/cli-typer
```

## Usage
```
cli-typer [options]
```
##### Options:
- `-h, --help` Show help
- `-t, --time` Given time in seconds to complete the test
- `-w, --words` Number of words to display per line
- `-i, --input` Path to a wordlist file with new line separated words
- `-V, --verbose` Show settings on start
- `-s, --save` Path to file for saving results

## Saving results

When called with the `-s, --save` option, results will be written to a file at the given path. Results are appended to the end of a tab-separated file so you can track your progress over time.

## Wordlists

### Linux
You can find additional wordlists in the `/usr/share/dict` directory and use them like so:
```
cli-typer -i /usr/share/dict/words
```

Install dictionaries on debian-based distributions with the `sudo apt install w[lang]` command, e.g. `sudo apt install wfrench` to install the French wordlist. Check out available packages [here](https://packages.debian.org/sid/wordlist).
