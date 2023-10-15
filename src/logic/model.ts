import { stdin, stdout } from "node:process";
import {
  boxSeparator,
  boxText,
  boxTop,
  drawBox,
  printConfig,
  printStats,
  setStartTime,
  setMessages
} from "../presentation/view";
import { getConfig } from "./argParser";
import { ALPHANUMERIC, SPECIAL } from "./consts";
import { lineGenerator } from "./generator";
import { conf, stats } from "./types";
import { fileToJSON } from "../persistence/reader";

const CONFIG: conf = getConfig();
const lineGen = lineGenerator(CONFIG);
let text: string, nextText: string, cursor: number;
let started: boolean;

// TODO explicit code / variable name standards
let STATS: stats = {
  corrects: 0,
  errors: 0,
  keypresses: 0,
  wpm: 0,
  accuracy: 0,
};
let interResults = "";
let wrote = "";
// The upper text which shows what to type
let results = "";
let messages = fileToJSON(`${__dirname}/../../messages.json`)[CONFIG.language];

function init() {
  setStartTime(Date.now());
  setMessages(messages);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  if (CONFIG.verbose) {
    printConfig(CONFIG);
  }
  console.log(`\n\t${messages.initialMessage}\n`);

  text = lineGen.next().value as string;
  nextText = lineGen.next().value as string;

  stdout.write(
    `${boxTop(CONFIG)}
${boxText(text)}
${boxText(nextText)}
${boxSeparator()}\n`
  );
  cursor = 0;
  started = false;
}

function start() {
  setInterval(() => {
    drawBox(CONFIG, results, text, cursor, nextText, wrote);
  }, 333);
  setTimeout(() => {
    printStats(STATS, CONFIG, wrote);
  }, CONFIG.givenSeconds * 1000);
  setStartTime(Date.now());
  started = true;
}

let checkChar = (key: Buffer) => {
  // waiting for the first char
  if (!started) start();

  // Exit on ctrl-c
  if (key.toString() === SPECIAL.CTRL_C) {
    process.exit();
  } else if (key.toString() === SPECIAL.BACKSPACE) {
    // Do nothing on the beginning of the line
    if (cursor === 0) {
      return;
    }

    // Remove error from stats for a more fair calculation
    if (interResults.slice(-1) === "x") {
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
    nextText = lineGen.next().value as string;
    cursor = 0;
    wrote = "";
    results = "";
  } else if (
    !ALPHANUMERIC.test(key.toString()) ||
    key.toString().charCodeAt(0) === 27 ||
    key.toString().charCodeAt(0) === 13
  ) {
    // Return on non-alphanumeric unicode characters
    // Regex generated with: http://kourge.net/projects/regexp-unicode-block
    interResults += "x";
    results += SPECIAL.RED_BG;
    STATS.errors++;
    results += text[cursor] + SPECIAL.RESET;
    cursor++;
    STATS.keypresses++;
    return;
  } else {
    wrote += key;

    if (key.toString() === text[cursor]) {
      interResults += "o";
      results += SPECIAL.GREEN_BG;
      STATS.corrects++;
    } else {
      interResults += "x";
      results += SPECIAL.RED_BG;
      STATS.errors++;
    }
    results += text[cursor] + SPECIAL.RESET;
    cursor++;
    STATS.keypresses++;
  }
  drawBox(CONFIG, results, text, cursor, nextText, wrote);
};

export { checkChar, init, start };
