# Lexer & Scanner

**Course:** Formal Languages & Finite Automata

**Author:** Iamandii Ion

## Theory

The term lexer comes from lexical analysis, which is the process of breaking down a sequence of characters into meaningful units called tokens. This is one of the first steps in compiling or interpreting a programming language, markup language, or any structured text format. The lexer is also commonly known as a tokenizer or scanner, as it scans the input and identifies recognizable patterns according to predefined rules.

A lexer operates by reading an input string and matching sequences of characters against a set of lexical rules that define the valid tokens in a language. Each recognized sequence of characters is assigned a token type, which is used by the next phase of processing—typically the parser—to build a structured representation of the program or document.

One important distinction in lexical analysis is between tokens and lexemes:

- Lexemes: These are the raw substrings extracted from the input based on delimiters, such as spaces, punctuation, or special characters. They are simply the direct output of splitting the input without any additional classification.
- Tokens: These represent a more structured form of lexemes. A token includes both the lexeme and its type (e.g., keyword, identifier, number, operator). Tokens may also contain additional metadata, such as the position of the lexeme in the input.

## Objectives

1. **Understand what lexical analysis is.**

2. **Get familiar with the inner workings of a lexer/scanner/tokenizer.**

3. **Implement a sample lexer and show how it works.**

## Implementation Description

### **tokenize() method**

This is the core method of the `Lexer` class that processes the input string and generates a list of tokens.

#### **How it Works:**

1. **Iterate through the input**: The method iterates over the input string, invoking other methods to handle different token types (identifiers, numbers, strings, symbols).
2. **Skip Whitespace**: It uses the `skipWhitespace()` method to ignore spaces and move to the next meaningful character.
3. **Identify and Tokenize**:
   - It checks the character type at the current position using helper methods (`isAlpha()`, `isDigit()`, etc.) to determine whether to handle an identifier, number, string, or symbol.
4. **Return Tokens**: After processing the input, it returns the list of generated tokens.

```javascript
tokenize() {
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;

      const ch = this.peek();

      if (this.isAlpha(ch)) {
        this.tokenizeIdentifierOrKeyword();
      } else if (this.isDigit(ch)) {
        this.tokenizeNumber();
      } else if (ch === '"') {
        this.tokenizeString();
      } else {
        this.tokenizeSymbol();
      }
    }
    console.log(this.tokens);
    return this.tokens;
}
```

### **skipWhitespace() method**

This method checks whether the FA is **deterministic (DFA)** or **non-deterministic (NDFA)**.

### **How it Works:**

1. **Loop through characters:** It repeatedly checks if the current character is a whitespace character using a regular expression (/\s/).
2. **Advance Position:** As long as whitespace characters are encountered, it advances the position pointer to skip them.

```javascript
skipWhitespace() {
    while (!this.isAtEnd() && /\s/.test(this.peek())) {
      this.advance();
    }
}
```

### **tokenizeIdentifierOrKeyword() method**

This method processes sequences of alphabetic characters and classifies them as either identifiers or keywords.

#### **How it Works:**

1. **Identify Sequence:** It identifies a sequence of characters that represent an identifier or keyword.
2. **Classify Token:** If the sequence matches one of the predefined keywords, it creates a keyword token. Otherwise, it generates an identifier token.
3. **Store Token:** The method adds the generated token to the list of tokens.

```javascript
tokenizeIdentifierOrKeyword() {
    let start = this.position;
    while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const text = this.input.substring(start, this.position);
    const keywords = new Set([
      "let",
      "if",
      "elif",
      "else",
      "resolve",
      "possible",
      "getOxidixngs",
      "getReducings",
      "show",
      "getMolecWeight",
      "getVolume",
      "getV",
      "isAcid",
      "isBase",
    ]);
    if (keywords.has(text)) {
      this.tokens.push({ type: "KEYWORD_TOKEN", value: text });
    } else {
      this.tokens.push({ type: "IDENTIFIER_TOKEN", value: text });
    }
}
```

### **tokenizeSymbol() method**

This method handles the recognition and tokenization of symbols like operators and punctuation (e.g., +, =, (, )).

#### **How it Works:**

1. **Single or Multi-character Symbols:** It checks if a character is part of a multi-character operator (like >=, <=).
2. **Classify Symbol:** If it is a valid operator or punctuation, it creates the corresponding token.
3. **Store Token:** The symbol token is then added to the list of tokens.

```javascript
tokenizeSymbol() {
    // Tokenize symbols such as operators and punctuation
    const ch = this.advance();
    // Check for multi-character operators (>=, <=)
    if (
      (ch === ">" || ch === "<" || ch === "=" || ch === "!") &&
      this.peek() === "="
    ) {
      const op = ch + this.advance();
      this.tokens.push({ type: "OPERATOR_TOKEN", value: op });
      return;
    }

    switch (ch) {
      case "+":
      case ">":
      case "<":
      case "=":
        this.tokens.push({ type: "OPERATOR_TOKEN", value: ch });
        break;
      case "(":
      case ")":
      case "{":
      case ",":
        this.tokens.push({ type: "PUNCTUATION_TOKEN", value: ch });
        break;
      case "}":
      case ";":
        this.tokens.push({ type: "EXP", value: ch });
        break;
      default:
        throw new Error("Unexpected character: " + ch);
    }
}
```

## **Conclusions & Results**

The Lexer class provides essential functionality to tokenize input strings based on various patterns (keywords, identifiers, numbers, strings, and symbols).

The tokenize() method is the central function that processes the entire input and generates the tokens using various specialized methods for each token type.

Methods like tokenizeIdentifierOrKeyword(), tokenizeNumber(), tokenizeString(), and tokenizeSymbol() ensure that each type of token is recognized and correctly categorized, which is critical for further stages of language processing like parsing.

Whitespace skipping ensures that the lexer only processes meaningful characters in the input, simplifying the tokenization process.

The lexer is a key component in building a compiler or interpreter, providing the foundation for syntax and semantic analysis.

### **Sample Output:**

```
[
  { type: 'KEYWORD_TOKEN', value: 'let' },
  { type: 'IDENTIFIER_TOKEN', value: 'a' },
  { type: 'OPERATOR_TOKEN', value: '=' },
  { type: 'NUMBER_TOKEN', value: '5' },
  { type: 'EXP', value: ';' },
  { type: 'KEYWORD_TOKEN', value: 'let' },
  { type: 'IDENTIFIER_TOKEN', value: 'b' },
  { type: 'OPERATOR_TOKEN', value: '=' },
  { type: 'NUMBER_TOKEN', value: '10' },
  { type: 'EXP', value: ';' },
  { type: 'KEYWORD_TOKEN', value: 'if' },
  { type: 'PUNCTUATION_TOKEN', value: '(' },
  { type: 'IDENTIFIER_TOKEN', value: 'a' },
  { type: 'OPERATOR_TOKEN', value: '>' },
  { type: 'IDENTIFIER_TOKEN', value: 'b' },
  { type: 'PUNCTUATION_TOKEN', value: ')' },
  { type: 'PUNCTUATION_TOKEN', value: '{' },
  { type: 'KEYWORD_TOKEN', value: 'resolve' },
  { type: 'PUNCTUATION_TOKEN', value: '(' },
  { type: 'IDENTIFIER_TOKEN', value: 'a' },
  { type: 'PUNCTUATION_TOKEN', value: ',' },
  { type: 'IDENTIFIER_TOKEN', value: 'b' },
  { type: 'PUNCTUATION_TOKEN', value: ')' },
  { type: 'EXP', value: ';' },
  { type: 'EXP', value: '}' },
  { type: 'KEYWORD_TOKEN', value: 'elif' },
  { type: 'PUNCTUATION_TOKEN', value: '(' },
  { type: 'IDENTIFIER_TOKEN', value: 'a' },
  { type: 'OPERATOR_TOKEN', value: '<' },
  { type: 'IDENTIFIER_TOKEN', value: 'b' },
  { type: 'PUNCTUATION_TOKEN', value: ')' },
  { type: 'PUNCTUATION_TOKEN', value: '{' },
  { type: 'KEYWORD_TOKEN', value: 'possible' },
  { type: 'PUNCTUATION_TOKEN', value: '(' },
  { type: 'IDENTIFIER_TOKEN', value: 'a' },
  { type: 'PUNCTUATION_TOKEN', value: ',' },
  { type: 'IDENTIFIER_TOKEN', value: 'b' },
  { type: 'PUNCTUATION_TOKEN', value: ')' },
  { type: 'EXP', value: ';' },
  { type: 'EXP', value: '}' },
  { type: 'KEYWORD_TOKEN', value: 'else' },
  { type: 'PUNCTUATION_TOKEN', value: '{' },
  { type: 'KEYWORD_TOKEN', value: 'show' },
  { type: 'PUNCTUATION_TOKEN', value: '(' },
  { type: 'STRING_TOKEN', value: 'a is equal to b' },
  { type: 'PUNCTUATION_TOKEN', value: ')' },
  { type: 'EXP', value: ';' },
  { type: 'EXP', value: '}' }
]
```

## **References**

- Course materials on Formal Languages & Finite Automata.
