const SPECIAL = {
  CTRL_C: "\u0003",
  BACKSPACE: "\u007f",
  GREEN_BG: "\x1b[42m",
  RED_BG: "\x1b[41m",
  GREEN_TEXT: "\x1b[32m",
  RESET: "\x1b[0m",
};

const ALPHANUMERIC = /[\u0000-\u024F\u0370-\u052F]/u;

const ANSI_ESCAPE =
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export { SPECIAL, ALPHANUMERIC, ANSI_ESCAPE };
