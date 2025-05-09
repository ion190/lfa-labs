# Parser & Building an Abstract Syntax Tree

### Course: Formal Languages & Finite Automata

### Author: Ion Iamandii

---

## Theory

The process of gathering syntactical meaning or doing a syntactical analysis over some text can also be called parsing. It usually results in a parse tree which can also contain semantic information that could be used in subsequent stages of compilation, for example.

Similarly to a parse tree, in order to represent the structure of an input text one could create an Abstract Syntax Tree (AST). This is a data structure that is organized hierarchically in abstraction layers that represent the constructs or entities that form up the initial text. These can come in handy also in the analysis of programs or some processes involved in compilation.

## Objectives:

- Get familiar with parsing, what it is and how it can be programmed
- Get familiar with the concept of AST
- In addition to what has been done in the 3rd lab work do the following:

  a. In case you didn't have a type that denotes the possible types of tokens you need to:

  - Have a type TokenType (like an enum) that can be used in the lexical analysis to categorize the tokens.
  - Please use regular expressions to identify the type of the token.

  b. Implement the necessary data structures for an AST that could be used for the text you have processed in the 3rd lab work.

  c. Implement a simple parser program that could extract the syntactic information from the input text.

## Implementation description

### **Lexer.tokenize() method**

This method scans the input string and produces a flat list of `{type, value}` tokens.

### How it Works:

1. **Loop** until the input string is empty.
2. **Try each** regex in `this.tokenSpecs` in order:
   - If it matches, record the matched text and token type (unless `type` is `null`).
   - Slice off the matched text from the front of `input`.
3. **Error** if no regex matches the current input prefix.
4. **Append** an EOF token at the end.

```javascript
tokenize() {
  let input = this.input;
  while (input.length > 0) {
    let matched = false;
    for (let [regex, type] of this.tokenSpecs) {
      const match = regex.exec(input);
      if (!match) continue;
      matched = true;
      const text = match[0];
      if (type) this.tokens.push({ type, value: text });
      input = input.slice(text.length);
      break;
    }
  }
  this.tokens.push({ type: TokenType.EOF, value: null });
  return this.tokens;
}
```

### **Parser.parseStatement() method**

Determines which kind of statement is next and parses it.

### How it Works:

- **`let`** → calls `parseVariableDeclaration()`.
- **`if` / `elif` / `else`** → calls `parseIfStatement()`.
- **Identifier (call expressions)** → parses an expression and wraps in `ExpressionStatement`.
- **Error** if none match.

```javascript
parseStatement() {
  const tok = this.peek();
  if (tok.type === TokenType.KEYWORD && tok.value === 'let') {
    return this.parseVariableDeclaration();
  }
  if (tok.type === TokenType.KEYWORD && tok.value === 'if') {
    return this.parseIfStatement();
  }
  if (tok.type === TokenType.IDENTIFIER) {
    const expr = this.parseExpression();
    this.consume(TokenType.PUNCTUATION);
    return new ExpressionStatement(expr);
  }
}
```

### **Parser.parsePrimary() method**

Handles the most basic units: numbers, strings, identifiers, and function calls.

### How it Works:

- **Numbers** → converted to JavaScript `Number` and wrapped in `Literal`.
- **Strings** → stripped of quotes and wrapped in `Literal`.
- **Identifiers** → checked for a `(` to decide if it’s a `CallExpression` or a plain `Identifier`.
- **Error** for any other token type.

```javascript
parsePrimary() {
  const tok = this.peek();
  if (tok.type === TokenType.NUMBER) {
    this.consume(TokenType.NUMBER);
    return new Literal(Number(tok.value));
  }
  if (tok.type === TokenType.STRING) {
    this.consume(TokenType.STRING);
    return new Literal(tok.value.slice(1, -1));
  }
  if (tok.type === TokenType.IDENTIFIER) {
    const id = this.consume(TokenType.IDENTIFIER).value;
    if (this.peek().value === '(') {
      this.consume(TokenType.PUNCTUATION);
      const args = [];
      while (this.peek().value !== ')') {
        args.push(this.parseExpression());
        if (this.peek().value === ',') this.consume(TokenType.PUNCTUATION);
      }
      this.consume(TokenType.PUNCTUATION);
      return new CallExpression(new Identifier(id), args);
    }
    return new Identifier(id);
  }
}
```

## Conclusions

**Actions Performed:**

- **TokenType Definition**: Established a clear enumeration of token categories (keywords, identifiers, numbers, strings, operators, punctuation, EOF).
- **Lexical Analysis**: Implemented a regex-based `Lexer.tokenize()` method that scans the input, skips comments/whitespace, and emits a flat list of `{type, value}` tokens.
- **AST Node Construction**: Designed a hierarchy of AST node classes (`Program`, `VariableDeclaration`, `IfStatement`, `ExpressionStatement`, `CallExpression`, `BinaryExpression`, `Literal`, `Identifier`) to represent every syntactic construct.
- **Recursive-Descent Parsing**: Built a `Parser` with methods (`parse()`, `parseStatement()`, `parseExpression()`, `parsePrimary()`) that walk the token stream, recognize statements and expressions, and instantiate the appropriate AST nodes.
- **AST Generation**: Combined the lexer and parser in a self-contained script to produce a nested JSON AST for the hard-coded input, faithfully mirroring variable declarations, if/elif/else chains, and function calls.

**Difficulties Faced:**

- **Statement Dispatch**: Extending `parseStatement()` to handle both declarations and bare call expressions required adding an `ExpressionStatement` node and adjusting the dispatch logic.
- **Token Classification**: Balancing regex order and specificity so that keywords (e.g., `let`, `if`, `elif`, `else`) are not misclassified as identifiers, while still allowing arbitrary function names.
- **Nested Constructs**: Correctly parsing nested `if–elif–else` blocks without left recursion, by treating `elif` as a nested `IfStatement`.
- **Error Reporting**: Generating meaningful error messages when encountering unexpected tokens (e.g., mismatched parentheses, unexpected statement starts) to aid debugging.

This lab demonstrates a complete pipeline from raw source text through tokenization and parsing to a fully formed Abstract Syntax Tree, laying the groundwork for further semantic analysis or code generation.```

### **Sample Output:**

```
{
  "statements": [
    {
      "identifier": {
        "name": "a"
      },
      "expression": {
        "value": 5
      }
    },
    {
      "identifier": {
        "name": "b"
      },
      "expression": {
        "value": 10
      }
    },
    {
      "condition": {
        "left": {
          "name": "a"
        },
        "operator": ">",
        "right": {
          "name": "b"
        }
      },
      "thenBranch": {
        "statements": [
          {
            "expression": {
              "callee": {
                "name": "resolve"
              },
              "args": [
                {
                  "name": "a"
                },
                {
                  "name": "b"
                }
              ]
            }
          }
        ]
      },
      "elseBranch": {
        "condition": {
          "left": {
            "name": "a"
          },
          "operator": "<",
          "right": {
            "name": "b"
          }
        },
        "thenBranch": {
          "statements": [
            {
              "expression": {
                "callee": {
                  "name": "possible"
                },
                "args": [
                  {
                    "name": "a"
                  },
                  {
                    "name": "b"
                  }
                ]
              }
            }
          ]
        },
        "elseBranch": {
          "statements": [
            {
              "expression": {
                "callee": {
                  "name": "show"
                },
                "args": [
                  {
                    "value": "a is equal to b"
                  }
                ]
              }
            }
          ]
        }
      }
    }
  ]
}
```

## **References**

- Course materials on Formal Languages & Finite Automata.
