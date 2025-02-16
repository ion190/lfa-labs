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
