#!/usr/bin/env node
import {stdin} from "node:process";
import {flagExists} from "./logic/argParser";
import {checkChar, init} from "./logic/model";

// Show help if at least one of these flags are present
if (flagExists("h", "help")) {
  console.log(`Usage:
  cli-typer [options]
\nOptions:
  -t, --time\t\tGiven time in seconds to complete the test
  -w, --words\t\tNumber of words to display per line
  -i, --input\t\tPath to a wordlist file with new line separated words
  -V, --verbose\t\tShow settings on start
  -s, --save\t\tPath to file for saving results
  -h, --help\t\tShow help`);
  process.exit();
}

init();
stdin.on("data", (key) => checkChar(key));
