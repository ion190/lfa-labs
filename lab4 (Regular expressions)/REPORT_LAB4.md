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

### How it Works:

The parsing mechanism converts a simplified regex-like string into a structured format that can later be interpreted or transformed. This is achieved through a step-by-step scan of the input string using a position pointer and a dynamic list of components.

1. **Initialization**

   - An empty array `components` is created to store the parsed elements.
   - A pointer variable `pos` is initialized at 0 and used to traverse the regex string character by character.
   - As the string is parsed, each recognized element (group, literal, or quantifier) is converted into a structured object or dictionary and pushed into the `components` array.

2. **Handling Groups (e.g., `(a|b|c)`)**

   - When an opening parenthesis `(` is encountered, it signals the start of a group.
   - The parser searches forward to find the corresponding closing `)` by tracking nested parentheses to ensure proper matching even within nested structures.
   - Once matched, the content inside the parentheses (e.g., `a|b|c`) is extracted and split by the pipe `|` character to create an array of options: `['a', 'b', 'c']`.
   - After the closing `)`, the parser checks if a quantifier (like `*`, `+`, `{n}`, or `{n,m}`) immediately follows the group. If found, the quantifier is parsed and associated with the group.
   - The resulting group object is added to the `components` list with properties like `type: 'group'`, `options`, and `quantifier`.

3. **Handling Literals (Non-Group Characters)**

   - If the current character is not part of a group (i.e., not `(`), it is treated as a literal.
   - The parser collects consecutive literal characters until it encounters a control character such as `(`, `*`, `+`, or `{`, which signals the end of the literal sequence or the beginning of a quantifier.
   - If a quantifier follows the literal sequence, it is parsed and attached to the literal component.
   - The completed literal is stored in the `components` list as an object with fields like `type: 'literal'`, `value`, and optional `quantifier`.

4. **Quantifier Parsing**

   - Quantifiers define how many times a component should be repeated.
   - The parser supports standard quantifiers such as:
     - `*` (zero or more)
     - `+` (one or more)
     - `{n}` (exactly n times)
     - `{n,m}` (between n and m times)
   - These are normalized into a consistent internal representation (e.g., `min`, `max`) for later interpretation or generation.

5. **Building the Final Structure**
   - After traversing the entire string, the `components` array contains a structured representation of the input pattern.
   - This structure can then be used for string generation, validation, or transformation based on custom logic.

```javascript
function parseRegex(regex) {
  let components = [];
  let pos = 0;
  while (pos < regex.length) {
    if (regex[pos] === "(") {
      let depth = 1;
      let end = pos + 1;
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

### How it Works:

The system processes a pattern-based structure by iterating over each defined component, interpreting and transforming them into a final output based on their type and behavior rules.

1. **Component Iteration**  
   The pattern is broken down into individual components. Each component is processed sequentially, with its specific rules determining how it contributes to the final result.

2. **Group Handling (e.g., `(S|T)`)**  
   When a component is a group with multiple options separated by a pipe symbol (`|`), such as `(S|T)`, it is treated as a set of possible values. The group is first split into its individual options, e.g., `['S', 'T']`, and then one of these options is randomly selected for each occurrence. This introduces controlled randomness, allowing for dynamic variation in the output.

3. **Literal Repetition (e.g., `w*`)**  
   If a component is a literal character followed by an asterisk (e.g., `w*`), it indicates that the character should be repeated. The number of repetitions is determined by the `getRepetitions()` function, which typically returns a random or rule-based integer. For example, `w*` might expand to `www` if `getRepetitions()` returns 3.

4. **Combining Results**  
   After each component is processed according to its type, the resulting strings are concatenated to form the complete final output.

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
