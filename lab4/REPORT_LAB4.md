# Regular expressions

### Course: Formal Languages & Finite Automata

### Author: Ion Iamandii

---

## Theory

Regular expressions (regex) are sequences of characters that define search patterns. They are primarily used for string matching, validation, and manipulation. Common uses include:

- Validating input formats (emails, phone numbers).
- Searching and replacing text in documents.
- Parsing structured data from unstructured text.

## Objectives:

- Write and cover what regular expressions are, what they are used for;
- For variant 4 I need to do the following:

  a. Write a code that will generate valid combinations of symbols conform given regular expressions (examples will be shown). Be careful that idea is to interpret the given regular expressions dinamycally, not to hardcode the way it will generate valid strings. You give a set of regexes as input and get valid word as an output

  b. In case you have an example, where symbol may be written undefined number of times, take a limit of 5 times (to evade generation of extremely long combinations);

  c. Bonus point: write a function that will show sequence of processing regular expression (like, what you do first, second and so on)

- Write a good report covering all performed actions and faced difficulties.

## Implementation description

### **parseRegex(regex) method**

This function breaks down a regex string into manageable components (groups or literals) along with their quantifiers (\*, +, {n}).

#### **How it Works:**

1. **Initialization:** An empty array components stores parsed elements. A pointer pos tracks the current position in the regex string.
2. **Handling Groups (a|b|c):** When encountering (, it finds the matching ) by tracking nested parentheses. Extracts the group content (e.g., S|T from (S|T)). Checks for a following quantifier (\*, +, {n}) and stores it.
3. **Handling Literals (Non-Group Characters):** Collects characters until a (, \*, +, or { is found. If a quantifier follows, it captures and stores it.

```javascript
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
```

### **generateString(components) method**

This function constructs a string by processing parsed components.

#### **How it Works:**

1. Iterates over each component.
2. **For groups (S|T):** Splits options (['S', 'T']). Randomly selects one per repetition.
3. **For literals (w\*):** Repeats the character based on getRepetitions().

```javascript
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
```

## Conclusions

Actions Performed:

- Regex Parsing: Components are identified as groups or literals with quantifiers.
- Quantifier Handling: Limits applied to avoid excessively long strings.
- String Generation: Components are processed sequentially to build the final string.
- Step Tracking: Bonus functionality to log each processing step.

Difficulties Faced:

- Parsing Complexity: Accurately distinguishing groups and literals while handling quantifiers.
- Quantifier Logic: Ensuring \*, +, and {n} are correctly interpreted with limits.
- Edge Cases: Handling multi-character literals with quantifiers (assumed absent in input regexes).

Overall, this project highlights the flexibility of regex processing and serves as a solid foundation for more complex string-generation tasks.

### **Sample Output:**

```
Svwwwwwyyy24
Group 'S|T' with '': chose [T] → 'T'
Group 'u|v' with '': chose [v] → 'v'
Literal 'w' with '*': repeated 4 times → 'wwww'
Literal 'y' with '+': repeated 3 times → 'yyy'
Literal '24' with '': repeated 1 times → '24'
```

## **References**

- Course materials on Formal Languages & Finite Automata.
