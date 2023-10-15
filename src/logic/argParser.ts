
function validateIntArg(flags: string[], arg: string) {
  const intArg = parseInt(arg, 10);
  if (isNaN(intArg)) {
    console.log(
      `"${arg}"\n${flags.join(", ")} arg should be a whole number.\n`
    );
    return false;
  }
  if (intArg < 1) {
    console.log(`${flags.join(", ")} must be higher than 0. Set to default.\n`);
    return false;
  }
  return intArg;
}
function argvParser(
  flags: [string, string],
  dflt: string | number | boolean,
  validateFunction: any = false
) {
  for (let flag of flags) {
    if (process.argv.indexOf(flag) !== -1) {
      const param = process.argv[process.argv.indexOf(flag) + 1];
      if (!validateFunction) {
        return param;
      }
      const validatedParam = validateFunction(flags, param);
      if (!validatedParam) {
        break;
      }
      return validatedParam;
    }
  }
  return dflt;
}
const flagExists = (shortFlag: string, longFlag: string) => {
  return (
    process.argv.indexOf(`-${shortFlag}`) !==
    process.argv.indexOf(`--${longFlag}`)
  );
};
function getConfig() {
  return {
    language: argvParser(["-l", "--lang"], "en"),
    wordsPerLine: argvParser(["-w", "--words"], 9, validateIntArg),
    givenSeconds: argvParser(["-t", "--time"], 60, validateIntArg),
    inputFile: argvParser(
      ["-i", "--input"],
      __dirname + "/../../data.json"
    ),
    verbose: flagExists("V", "verbose"),
    savePath: argvParser(["-s", "--save"], false),
  };
}
export {flagExists, getConfig};

