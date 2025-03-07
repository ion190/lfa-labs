# Determinism in Finite Automata. Conversion from NDFA 2 DFA. Chomsky Hierarchy.

**Course:** Formal Languages & Finite Automata

**Author:** Iamandii Ion

## Theory

A finite automaton is a mathematical model used to represent and analyze different types of processes, particularly in computing and theoretical computer science. It closely resembles a state machine, as both are structured around states and transitions that dictate the behavior of a system. The term finite highlights the fact that an automaton operates within a defined set of states, beginning from an initial state and eventually reaching one of the designated final states. This characteristic ensures that any process modeled by an automaton has a clear starting point and a well-defined conclusion.

The structure of an automaton can sometimes allow a single transition to lead to multiple possible states, introducing non-determinism. In the context of system theory, determinism refers to how predictable a system is—if the outcome is entirely defined by the current state and input, the system is deterministic. However, when randomness or multiple choices come into play, the system exhibits stochastic or non-deterministic behavior. This uncertainty can make certain computations more complex, requiring additional techniques to analyze or simulate them.

Automata are therefore categorized as either deterministic (DFA) or non-deterministic (NFA). While NFAs offer greater flexibility in design, they can often be converted into equivalent DFAs through a structured transformation process. This conversion, typically done using algorithms such as the subset construction method, ensures that a non-deterministic automaton can be restructured into a deterministic one, making it easier to implement in practical applications such as lexical analysis, pattern matching, and formal language recognition.

## Objectives

1. **Understand what an automaton is and what it can be used for.**

2. **Continuing the work in the same repository and the same project, the following need to be added:**

   - a. Provide a function in your grammar type/class that could classify the grammar based on Chomsky hierarchy.
   - b. For this, you can use the variant from the previous lab.

3. **According to your variant number (by universal convention it is register ID), get the finite automaton definition and do the following tasks:**
   - a. Implement conversion of a finite automaton to a regular grammar.
   - b. Determine whether your FA is deterministic or non-deterministic.
   - c. Implement some functionality that would convert an NDFA to a DFA.
   - d. Represent the finite automaton graphically _(Optional, and can be considered as a bonus point)_:
     - You can use external libraries, tools, or APIs to generate the figures/diagrams.
     - Your program needs to gather and send the data about the automaton, and the library/tool/API returns the visual representation.

## Implementation Description

### **toRegularGrammar() method**

This method converts a **Finite Automaton (FA)** into a **Regular Grammar**. A regular grammar is a set of production rules that describe the same language as the FA. The method works by iterating through each state and mapping transitions into corresponding grammar rules.

#### **How it Works:**

1. **Initialize an empty grammar**: A dictionary (`grammar`) where each key represents a state, and its value is a list of production rules.
2. **Iterate through states**: For each state, check the possible transitions defined by the FA.
3. **Generate production rules**:
   - If a state transitions to another state on an input symbol, a rule of the form `symbolNextState` is added.
   - If the state is a final state, it also generates an **ε-rule**, allowing the grammar to produce an empty string.
4. **Return the grammar**: The final dictionary contains a complete set of production rules equivalent to the FA.

```javascript
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
```

### **isDeterministic() method**

This method checks whether the FA is **deterministic (DFA)** or **non-deterministic (NDFA)**.

### **How it Works:**

1. **Iterate through each state** in the FA.
2. **Check transitions for each symbol** in the alphabet:
   - If a state has **more than one transition for the same input symbol**, it means multiple states can be reached, indicating **non-determinism**.
3. **Return `false` if any state is non-deterministic**, otherwise return `true`.

```javascript
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
```

### **toDFA() method**

This method **converts a Non-Deterministic Finite Automaton (NDFA) to a Deterministic Finite Automaton (DFA)** using the **subset construction algorithm**.

#### **How it Works:**

1. **Create the initial DFA state**, which is a set containing only the start state.
2. **Use a queue to process each DFA state**:
   - Track which states have been processed.
   - Each DFA state is actually a **set of original NDFA states**.
3. **Iterate through input symbols**:
   - Collect all possible states the FA can transition to using a given symbol.
   - If this set of states is new, add it to the DFA's states list.
4. **Mark final states**: Any DFA state that contains at least one final NDFA state is marked as a final state in the DFA.
5. **Return the newly constructed DFA**, represented as a new `FiniteAutomaton` instance.

```javascript
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
```

## **Conclusions & Results**

- **Regular grammar conversion** ensures that the FA's behavior can be expressed as production rules.
- **Determinism check** helps classify the FA as either **deterministic (DFA)** or **non-deterministic (NDFA)**.
- **NDFA to DFA conversion** eliminates non-determinism by **grouping states** into single DFA states.
- The program demonstrates **core automata theory principles**, making it useful for **academic and practical applications**.

### **Sample Output:**

```
Regular Grammar:
{
  q0: [ 'aq1', 'bq0' ],
  q1: [ 'bq1', 'bq2' ],
  q2: [ 'aq2', 'bq3' ],
  q3: [ 'ε' ]
}
Is Deterministic: false
DFA Transitions:
{
  '["q0"]': { a: '["q1"]', b: '["q0"]' },
  '["q1"]': { a: '[]', b: '["q1","q2"]' },
  '["q1","q2"]': { a: '["q2"]', b: '["q1","q2","q3"]' },
  '["q2"]': { a: '["q2"]', b: '["q3"]' },
  '["q1","q2","q3"]': { a: '["q2"]', b: '["q1","q2","q3"]' },
  '["q3"]': { a: '[]', b: '[]' }
}
```

## **References**

- Course materials on Formal Languages & Finite Automata.
