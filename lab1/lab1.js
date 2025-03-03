class Grammar {
  constructor(nonTerminals, terminals, productions, startSymbol) {
    this.V_n = nonTerminals;
    this.V_t = terminals;
    this.P = productions;
    this.S = startSymbol;
  }

  generateString() {
    let current = this.S;
    let result = "";
    while (this.P[current]) {
      let nextRule =
        this.P[current][Math.floor(Math.random() * this.P[current].length)];
      result += nextRule.replace(/[A-Z]/g, ""); //remove non terminal
      let nextNonTerminal = nextRule.match(/[A-Z]/);
      if (nextNonTerminal) {
        current = nextNonTerminal[0];
      } else {
        break;
      }
    }
    return result;
  }

  toFiniteAutomaton() {
    let states = new Set([...this.V_n, "F"]);
    let transitions = {};
    let startState = this.S;
    let finalStates = new Set(["F"]);

    for (let [key, values] of Object.entries(this.P)) {
      transitions[key] = {};
      values.forEach((rule) => {
        let symbol = rule.replace(/[A-Z]/g, "");
        let nextState = rule.match(/[A-Z]/) ? rule.match(/[A-Z]/)[0] : "F";
        transitions[key][symbol] = nextState;
      });
    }

    return new FiniteAutomaton(
      states,
      this.V_t,
      transitions,
      startState,
      finalStates
    );
  }

  classifyGrammar() {
    let isType3 = true;
    let isType2 = true;
    let isType1 = true;

    for (let [left, right] of Object.entries(this.P)) {
      for (let rule of right) {
        // Check for Type 3 (Regular Grammar)
        if (
          !(
            (
              /^[a-z]?[A-Z]?$/.test(rule) || // Right-linear: aB or a
              /^[A-Z]?[a-z]?$/.test(rule)
            ) // Left-linear: Ba or a
          )
        ) {
          isType3 = false;
        }

        // Check for Type 2 (Context-Free Grammar)
        if (!/^[A-Z]→.+$/.test(`${left}→${rule}`)) {
          isType2 = false;
        }

        // Check for Type 1 (Context-Sensitive Grammar)
        if (rule.length < left.length) {
          isType1 = false;
        }
      }
    }

    if (isType3) {
      return "Type 3 (Regular Grammar)";
    } else if (isType2) {
      return "Type 2 (Context-Free Grammar)";
    } else if (isType1) {
      return "Type 1 (Context-Sensitive Grammar)";
    } else {
      return "Type 0 (Unrestricted Grammar)";
    }
  }
}

class FiniteAutomaton {
  constructor(states, alphabet, transitions, startState, finalStates) {
    this.Q = states;
    this.Sigma = alphabet;
    this.delta = transitions;
    this.q0 = startState;
    this.F = finalStates;
  }

  stringBelongToLanguage(inputString) {
    let currentState = this.q0;
    for (let symbol of inputString) {
      if (!this.delta[currentState] || !this.delta[currentState][symbol]) {
        return false;
      }
      currentState = this.delta[currentState][symbol];
    }
    return this.F.has(currentState);
  }
}

// Example
const grammar = new Grammar(
  ["S", "A", "B"],
  ["a", "b", "c", "d"],
  {
    S: ["bS", "dA"],
    A: ["aA", "dB", "b"],
    B: ["cB", "a"],
  },
  "S"
);

console.log("Generated strings:");
for (let i = 0; i < 5; i++) {
  console.log(grammar.generateString());
}

const automaton = grammar.toFiniteAutomaton();
console.log(
  "Does 'ba' belong to the language?",
  automaton.stringBelongToLanguage("ba")
);
console.log(
  "Does 'dba' belong to the language?",
  automaton.stringBelongToLanguage("dba")
);

// for lab 2
// classify a grammar based on the Chomsky hierarchy - determine whether it is Type 0, Type 1, Type 2, or Type 3
console.log("Grammar Classification:", grammar.classifyGrammar());
