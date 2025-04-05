function parseRegex(regex) {
  let components = [];
  let pos = 0;
  while (pos < regex.length) {
    if (regex[pos] === "(") {
      let depth = 1;
      let end = pos + 1;
      while (end < regex.length && depth > 0) {
        if (regex[end] === "(") depth++;
        else if (regex[end] === ")") depth--;
        end++;
      }
      let groupContent = regex.substring(pos + 1, end - 1);
      let quantifier = "";
      if (end < regex.length && "*+{".includes(regex[end])) {
        if (regex[end] === "{") {
          let braceEnd = regex.indexOf("}", end);
          quantifier = regex.substring(end, braceEnd + 1);
          end = braceEnd + 1;
        } else {
          quantifier = regex[end];
          end++;
        }
      }
      components.push({
        type: "group",
        content: groupContent,
        quantifier: quantifier,
      });
      pos = end;
    } else {
      let literalEnd = pos;
      while (literalEnd < regex.length && !"(*+{".includes(regex[literalEnd])) {
        literalEnd++;
      }
      let literal = regex.substring(pos, literalEnd);
      let quantifier = "";
      if (literalEnd < regex.length && "*+{".includes(regex[literalEnd])) {
        if (regex[literalEnd] === "{") {
          let braceEnd = regex.indexOf("}", literalEnd);
          quantifier = regex.substring(literalEnd, braceEnd + 1);
          literalEnd = braceEnd + 1;
        } else {
          quantifier = regex[literalEnd];
          literalEnd++;
        }
      }
      components.push({
        type: "literal",
        content: literal,
        quantifier: quantifier,
      });
      pos = literalEnd;
    }
  }
  return components;
}

function getRepetitions(quantifier) {
  if (!quantifier) return 1;
  if (quantifier === "*") return Math.floor(Math.random() * 6); // 0-5
  if (quantifier === "+") return Math.floor(Math.random() * 5) + 1; // 1-5
  if (quantifier.startsWith("{")) {
    let n = quantifier.slice(1, -1);
    return parseInt(n) || 1; // Default to 1 if invalid
  }
  return 1;
}

function generateString(components) {
  let result = [];
  for (let comp of components) {
    let reps = getRepetitions(comp.quantifier);
    if (comp.type === "group") {
      let options = comp.content.split("|");
      let choices = [];
      for (let i = 0; i < reps; i++) {
        choices.push(options[Math.floor(Math.random() * options.length)]);
      }
      result.push(choices.join(""));
    } else {
      result.push(comp.content.repeat(reps));
    }
  }
  return result.join("");
}

function generateWithSteps(components) {
  let result = [];
  let steps = [];
  for (let comp of components) {
    let reps = getRepetitions(comp.quantifier);
    let part;
    if (comp.type === "group") {
      let options = comp.content.split("|");
      let choices = [];
      for (let i = 0; i < reps; i++) {
        choices.push(options[Math.floor(Math.random() * options.length)]);
      }
      part = choices.join("");
      steps.push(
        `Group '${comp.content}' with '${comp.quantifier}': chose [${choices}] → '${part}'`
      );
    } else {
      part = comp.content.repeat(reps);
      steps.push(
        `Literal '${comp.content}' with '${comp.quantifier}': repeated ${reps} times → '${part}'`
      );
    }
    result.push(part);
  }
  return { result: result.join(""), steps: steps };
}

// usage:
const regex = "(S|T)(u|v)w*y+24";
const components = parseRegex(regex);
console.log(generateString(components));

// show steps:
const { result, steps } = generateWithSteps(components);
steps.forEach((step) => console.log(step));
