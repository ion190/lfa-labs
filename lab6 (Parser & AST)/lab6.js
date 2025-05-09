// 1. TokenType enumeration
const TokenType = Object.freeze({
  KEYWORD: "KEYWORD",
  IDENTIFIER: "IDENTIFIER",
  NUMBER: "NUMBER",
  STRING: "STRING",
  OPERATOR: "OPERATOR",
  PUNCTUATION: "PUNCTUATION",
  EOF: "EOF",
});

// 2. Lexer: regex-based tokenization
class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.tokens = [];
    this.tokenSpecs = [
      [/^\s+/, null],
      [/^\/\*[\s\S]*?\*\//, null],
      [/^\/\/.*$/, null],
      [/^let\b/, TokenType.KEYWORD],
      [/^if\b/, TokenType.KEYWORD],
      [/^elif\b/, TokenType.KEYWORD],
      [/^else\b/, TokenType.KEYWORD],
      [/^[a-zA-Z_][a-zA-Z0-9_]*/, TokenType.IDENTIFIER],
      [/^[0-9]+(?:\.[0-9]+)?/, TokenType.NUMBER],
      [/^"(?:\\.|[^"])*"/, TokenType.STRING],
      [/^>=|^<=|^==|^!=|^>|^<|^=/, TokenType.OPERATOR],
      [/^[+\-*/]/, TokenType.OPERATOR],
      [/^[(){};,]/, TokenType.PUNCTUATION],
    ];
  }

  tokenize() {
    let input = this.input;
    while (input.length > 0) {
      let matched = false;
      for (let [regex, type] of this.tokenSpecs) {
        const match = regex.exec(input);
        if (match) {
          matched = true;
          const text = match[0];
          if (type) this.tokens.push({ type, value: text });
          input = input.slice(text.length);
          break;
        }
      }
      if (!matched)
        throw new Error(`Unexpected token at: ${input.slice(0, 10)}`);
    }
    this.tokens.push({ type: TokenType.EOF, value: null });
    return this.tokens;
  }
}

// 3. AST Node Definitions
class ASTNode {}
class Program extends ASTNode {
  constructor(statements) {
    super();
    this.statements = statements;
  }
}
class VariableDeclaration extends ASTNode {
  constructor(identifier, expression) {
    super();
    this.identifier = identifier;
    this.expression = expression;
  }
}
class IfStatement extends ASTNode {
  constructor(condition, thenBranch, elseBranch) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}
class ExpressionStatement extends ASTNode {
  constructor(expression) {
    super();
    this.expression = expression;
  }
}
class CallExpression extends ASTNode {
  constructor(callee, args) {
    super();
    this.callee = callee;
    this.args = args;
  }
}
class BinaryExpression extends ASTNode {
  constructor(left, operator, right) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }
}
class Literal extends ASTNode {
  constructor(value) {
    super();
    this.value = value;
  }
}
class Identifier extends ASTNode {
  constructor(name) {
    super();
    this.name = name;
  }
}

// 4. Recursive-Descent Parser
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  peek() {
    return this.tokens[this.pos];
  }
  consume(type) {
    const token = this.peek();
    if (token.type !== type)
      throw new Error(`Expected ${type}, got ${token.type}`);
    this.pos++;
    return token;
  }

  parse() {
    const statements = [];
    while (this.peek().type !== TokenType.EOF) {
      statements.push(this.parseStatement());
    }
    return new Program(statements);
  }

  parseStatement() {
    const tok = this.peek();
    if (tok.type === TokenType.KEYWORD && tok.value === "let") {
      return this.parseVariableDeclaration();
    }
    if (tok.type === TokenType.KEYWORD && tok.value === "if") {
      return this.parseIfStatement();
    }
    if (tok.type === TokenType.IDENTIFIER) {
      const expr = this.parseExpression();
      this.consume(TokenType.PUNCTUATION);
      return new ExpressionStatement(expr);
    }
    throw new Error(`Unknown statement at ${tok.value}`);
  }

  parseVariableDeclaration() {
    this.consume(TokenType.KEYWORD);
    const id = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.OPERATOR);
    const expr = this.parseExpression();
    this.consume(TokenType.PUNCTUATION);
    return new VariableDeclaration(new Identifier(id), expr);
  }

  parseIfStatement() {
    this.consume(TokenType.KEYWORD);
    this.consume(TokenType.PUNCTUATION);
    const cond = this.parseExpression();
    this.consume(TokenType.PUNCTUATION);
    this.consume(TokenType.PUNCTUATION);
    const thenStmts = [];
    while (this.peek().value !== "}") thenStmts.push(this.parseStatement());
    this.consume(TokenType.PUNCTUATION);

    let elseBranch = null;
    if (
      this.peek().type === TokenType.KEYWORD &&
      this.peek().value === "elif"
    ) {
      elseBranch = this.parseIfStatement();
    } else if (
      this.peek().type === TokenType.KEYWORD &&
      this.peek().value === "else"
    ) {
      this.consume(TokenType.KEYWORD);
      this.consume(TokenType.PUNCTUATION);
      const elseStmts = [];
      while (this.peek().value !== "}") elseStmts.push(this.parseStatement());
      this.consume(TokenType.PUNCTUATION);
      elseBranch = new Program(elseStmts);
    }
    return new IfStatement(cond, new Program(thenStmts), elseBranch);
  }

  parseExpression() {
    let left = this.parsePrimary();
    while (this.peek().type === TokenType.OPERATOR) {
      const op = this.consume(TokenType.OPERATOR).value;
      const right = this.parsePrimary();
      left = new BinaryExpression(left, op, right);
    }
    return left;
  }

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
      if (this.peek().value === "(") {
        this.consume(TokenType.PUNCTUATION);
        const args = [];
        while (this.peek().value !== ")") {
          args.push(this.parseExpression());
          if (this.peek().value === ",") this.consume(TokenType.PUNCTUATION);
        }
        this.consume(TokenType.PUNCTUATION);
        return new CallExpression(new Identifier(id), args);
      }
      return new Identifier(id);
    }
    throw new Error(`Unknown primary at ${tok.value}`);
  }
}

const input = `let a = 5;
let b = 10;
if (a > b) {
  resolve(a, b);
}
elif (a < b) {
  possible(a, b);
} else {
  show("a is equal to b");
}`;

const lexer = new Lexer(input);
const tokens = lexer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();
console.log(JSON.stringify(ast, null, 2));
