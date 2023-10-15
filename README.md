[![Build Status](https://travis-ci.org/balzss/cli-typer.svg?branch=master)](https://travis-ci.org/balzss/cli-typer)

Practice touch typing in the commandline and measure your skills.
Coauthored by [qwhex](https://github.com/qwhex).

![cli-typer demo gif](https://raw.githubusercontent.com/balzss/cli-typer/master/demo.gif)

## Install

##### with npm
```
npm install -g balzss/cli-typer
```

##### manually
```
git clone https://github.com/GLUD/cli-learn-typing.git
cd cli-learn-typing
npm install
npm build
npm install -g .  # optional
node dist/index.js
```

## Dependecies

- [node.js](https://github.com/nodejs/node) >= 6.4.0
- Typescript

## Usage
```
cli-typer [options]
```

##### Options:
- `-h, --help` Show help
- `-t, --time` Given time in seconds to complete the test
- `-l, --lang` Give words to practice in 'en' or 'es'
- `-w, --words` Number of words to display per line
- `-i, --input` Path to a wordlist file with new line separated words
- `-V, --verbose` Show settings on start
- `-s, --save` Path to file for saving results

##### Saving results

When called with the `-s, --save` option, results will be written to a file at the given path. Results are appended to the end of a tab-separated file so you can track your progress over time.

## Wordlists

### Linux
You can find additional wordlists in the `/usr/share/dict` directory and use them like so:
```
cli-typer -i /usr/share/dict/words
```

Install dictionaries on debian-based distributions with the `sudo apt install w[lang]` command, e.g. `sudo apt install wfrench` to install the French wordlist. Check out available packages [here](https://packages.debian.org/sid/wordlist).
