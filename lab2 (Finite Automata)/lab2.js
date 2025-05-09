class FiniteAutomaton {
  constructor(states, alphabet, transitions, startState, finalStates) {
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
    this.startState = startState;
    this.finalStates = finalStates;
  }

  // cnvert FA to Regular Grammar
  toRegularGrammar() {
    let grammar = {};
    for (const state of this.states) {
      grammar[state] = [];
      for (const symbol of this.alphabet) {
        const nextStates = this.transitions[state]?.[symbol] || [];
        for (const nextState of nextStates) {
          grammar[state].push(`${symbol}${nextState}`);
        }
      }
      if (this.finalStates.includes(state)) {
        grammar[state].push("ε"); // empty string
      }
    }
    return grammar;
  }

  isDeterministic() {
    for (const state of this.states) {
      for (const symbol of this.alphabet) {
        const nextStates = this.transitions[state]?.[symbol] || [];
        if (nextStates.length > 1) {
          return false; //non-deterministic
        }
      }
    }
    return true; //deterministic
  }

  // convert NDFA to DFA
  toDFA() {
    const dfaTransitions = {};
    const dfaStates = [new Set([this.startState])];
    const dfaFinalStates = [];
    const queue = [[this.startState]];

    while (queue.length > 0) {
      const currentStates = queue.shift();
      const currentStateKey = JSON.stringify(currentStates);

      dfaTransitions[currentStateKey] = {};

      for (const symbol of this.alphabet) {
        const nextStates = new Set();
        for (const state of currentStates) {
          const transitions = this.transitions[state]?.[symbol] || [];
          for (const nextState of transitions) {
            nextStates.add(nextState);
          }
        }

        const nextStateKey = JSON.stringify([...nextStates]);
        dfaTransitions[currentStateKey][symbol] = nextStateKey;

        if (!dfaStates.some((s) => JSON.stringify(s) === nextStateKey)) {
          dfaStates.push([...nextStates]);
          queue.push([...nextStates]);
        }
      }

      if (currentStates.some((s) => this.finalStates.includes(s))) {
        dfaFinalStates.push(currentStateKey);
      }
    }

    return new FiniteAutomaton(
      dfaStates.map((s) => JSON.stringify(s)),
      this.alphabet,
      dfaTransitions,
      JSON.stringify([this.startState]),
      dfaFinalStates
    );
  }
}

// Variant 16
const states = ["q0", "q1", "q2", "q3"];
const alphabet = ["a", "b"];
const transitions = {
  q0: { a: ["q1"], b: ["q0"] },
  q1: { b: ["q1", "q2"] },
  q2: { a: ["q2"], b: ["q3"] },
};
const startState = "q0";
const finalStates = ["q3"];

const fa = new FiniteAutomaton(
  states,
  alphabet,
  transitions,
  startState,
  finalStates
);

// convert FA to Regular Grammar
console.log("Regular Grammar:");
console.log(fa.toRegularGrammar());

// determine if the FA is Deterministic or Non-Deterministic
console.log("Is Deterministic:", fa.isDeterministic());

// convert NDFA to DFA
const dfa = fa.toDFA();
console.log("DFA Transitions:");
console.log(dfa.transitions);
