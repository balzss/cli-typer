import { getWords } from "../persistence/reader";
import { conf } from "./types";

function random(min: number, max: number) {
  if (max === null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}
function shuffle(obj: string[]) {
  let sample = obj.slice();
  const last = sample.length - 1;
  for (let index = 0; index < sample.length; index++) {
    let rand = random(index, last);
    let temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice();
}
function* lineGenerator({ inputFile, wordsPerLine, language }: conf) {
  const words: string[] = getWords(inputFile, language);
  const shuffledWords = shuffle(words);
  for (
    let i = 0;
    i + wordsPerLine < shuffledWords.length - 1;
    i += wordsPerLine
  ) {
    yield shuffledWords.slice(i, i + wordsPerLine).join(" ");
  }
}

export { lineGenerator };
