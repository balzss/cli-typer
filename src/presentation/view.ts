import fs from "node:fs";
import { stdout } from "node:process";
import { ANSI_ESCAPE } from "../logic/consts";
import { conf, stats } from "../logic/types";

let startTime: number;
let boxDrawIsLocked = false;
let messages: any;

function setStartTime(startTim: number) {
  startTime = startTim;
}
function setMessages(msgs: any) {
  messages = msgs;
}
function removeAnsiEscape(text: string) {
  return text.replace(ANSI_ESCAPE, "");
}

function timePad(time: number) {
  return ("00" + time).slice(-2);
}

function calcRemainingTime(givenSeconds: number): string {
  let allSeconds = givenSeconds - Math.round((Date.now() - startTime) / 1000);
  let minutes = Math.floor(allSeconds / 60);
  let seconds = allSeconds % 60;
  return timePad(minutes) + ":" + timePad(seconds);
}

function boxTop({ givenSeconds }: conf, width = 79) {
  return (
    "╭" +
    "─".repeat(width - 14) +
    "┨ " +
    calcRemainingTime(givenSeconds) +
    " ┠───╮"
  );
}

function boxText(text: string, width = 79) {
  const spaceAvailable = width - 4 - removeAnsiEscape(text).length;
  if (spaceAvailable < 0) {
    return "│ " + text;
  }
  return "│ " + text + " ".repeat(spaceAvailable) + " │";
}

function boxSeparator(width = 79) {
  return "├" + "─".repeat(width - 2) + "┤";
}

function boxBottom(width = 79) {
  return "╰" + "─".repeat(width - 2) + "╯";
}

function drawBox(
  { givenSeconds }: conf,
  results: string,
  text: string,
  cursor: number,
  nextText: string,
  wrote: string
) {
  if (boxDrawIsLocked) {
    return;
  }
  boxDrawIsLocked = true;

  // Erase the whole thing and display the next words to type
  stdout.clearLine(0);
  stdout.moveCursor(0, -2);
  stdout.clearLine(0);
  stdout.moveCursor(0, -1);
  stdout.clearLine(0);
  stdout.moveCursor(0, -1);
  stdout.clearLine(0);
  stdout.cursorTo(0);
  stdout.write(
    `${boxTop({ givenSeconds } as conf)}\n` +
      `${boxText(results + text.substring(cursor))}\n` +
      `${boxText(nextText)}\n` +
      "\n│ " +
      wrote
  );

  boxDrawIsLocked = false;
}

function plural(times: number, noun: string) {
  const output = `${times} ${noun}`;
  return times !== 1 ? output + "s" : output;
}
function printConfig({
  givenSeconds,
  wordsPerLine,
  inputFile,
  savePath,
}: conf) {
  console.log(boxTop({ givenSeconds } as conf));
  console.log(boxText(`${messages.settings}`));
  console.log(boxSeparator());
  console.log(boxText(plural(givenSeconds, `${messages.second}`)));
  console.log(boxText(`${plural(wordsPerLine, `${messages.word}`)} ${messages.pl}`));
  console.log(boxText(`${messages.input}: ${inputFile}`));
  if (!savePath) {
    console.log(boxText(`${messages.save}: ${savePath}`));
  }
  console.log(boxBottom());
}
function saveStats(stats: stats, config: conf) {
  const date = new Date(startTime).toLocaleString();
  const headers =
    "Date\tLength (seconds)\tWPM\tKeystrokes\tCorrect\tWrong\tAccuracy\tInput\n";
  const content =
    [
      date,
      config.givenSeconds,
      stats.wpm,
      stats.keypresses,
      stats.corrects,
      stats.errors,
      stats.accuracy,
      config.inputFile,
    ].join("\t") + "\n";

  let data;
  try {
    fs.statSync(config.savePath).isFile();
    // If the file exists, assume headers have already been written
    data = content;
  } catch (exception: any) {
    if (exception.code === "ENOENT") {
      // Since the file does not exist, write the headers as well
      data = headers + content;
    } else {
      throw exception;
    }
  }

  fs.appendFileSync(config.savePath, data);
}
function printStats(STATS: stats, CONFIG: conf, wrote: string): void {
  STATS.wpm = Math.round((STATS.corrects / 5) * (60 / CONFIG.givenSeconds));
  STATS.accuracy =
    Math.round((STATS.corrects / STATS.keypresses) * 10000) / 100;
  if (CONFIG.savePath) {
    saveStats(STATS, CONFIG);
  }

  console.log(" ".repeat(79 - 3 - wrote.length) + "│\n" + boxSeparator());
  console.log(boxText(messages.timeup));
  console.log(boxText(`${messages.wpm}: ${STATS.wpm}`));
  console.log(boxText(`${messages.ks}: ${STATS.keypresses}`));
  console.log(boxText(`${messages.correct_ks}: ${STATS.corrects}`));
  console.log(boxText(`${messages.wrong_ks}: ${STATS.errors}`));
  console.log(boxText(`${messages.acc}: ${STATS.accuracy}%`));
  console.log(boxBottom());
  process.exit();
}
export {
  ANSI_ESCAPE,
  boxTop,
  boxSeparator,
  boxText,
  boxBottom,
  drawBox,
  printConfig,
  printStats,
  setStartTime,
  setMessages,
};
