import { getWords } from "../persistence/reader";

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
function* lineGenerator(path: string, numberOfWords: number) {
  const words: string[] = getWords(path);
  const shuffledWords = shuffle(words);
  for (
    let i = 0;
    i + numberOfWords < shuffledWords.length - 1;
    i += numberOfWords
  ) {
    yield shuffledWords.slice(i, i + numberOfWords).join(" ");
  }
}

export { lineGenerator };
