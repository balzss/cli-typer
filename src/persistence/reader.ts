import fs from "node:fs";

function fileToJSON(path: string) {
  let data = fs.readFileSync(path, { encoding: "utf8" });
  if (!data) {
    console.error("Error reading JSON file");
    return;
  }
  try {
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (parseError) {
    console.error("Error parsing JSON:", parseError);
  }
}

function getWords(path: string, lang:string="en"): string[] {
  let data = fileToJSON(path);
  return data[lang].words;
}
export {fileToJSON, getWords };
