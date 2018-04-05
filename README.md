Practice touch typing in the commandline and measure your skills.  
Coauthored by [qwhex](https://github.com/qwhex).

## Install

Via npm:
```
npm install -g balzss/cli-typer
```

Manually:
```
git clone https://github.com/balzss/cli-typer cli-typer
cd cli-typer
npm install -g .
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

## Wordlists

### Linux
You can find additional wordlists in the `/usr/share/dict` directory. Install additional dictionaries on debian-based distributions with the `sudo apt install w[lang]` command, e.g. `sudo apt install wfrench` to install the French wordlist. Check out available packages [here](https://packages.debian.org/sid/wordlist).
