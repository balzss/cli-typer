type conf = {
  wordsPerLine: number;
  givenSeconds: number;
  inputFile: string;
  verbose: boolean;
  savePath: string;
  language: string;
};
type stats = {
  corrects: number;
  errors: number;
  keypresses: number;
  wpm: number;
  accuracy: number;
};
export { conf, stats };
