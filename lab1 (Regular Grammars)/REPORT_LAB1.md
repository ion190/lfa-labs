# Implementation of Regular Grammars and Finite Automata

**Course:** Formal Languages & Finite Automata

**Author:** Iamandii Ion

## Theory

A **formal language** is a model used to define rules for building valid strings from a given alphabet. It is made out of:

- **Alphabet (V_T):** terminal symbols.
- **Vocabulary (V_N):** non-terminal symbols.
- **Grammar (P):** production rules that define how strings can be created.
- **Start Symbol (S):** initial non-terminal used to create valid strings.

A **Finite Automaton (FA)** is a model used to recognize patterns in formal languages. It is made out of:

- **States (Q):** finite set of states.
- **Alphabet (Σ):** input symbols.
- **Transition Function (δ):** state transitions.
- **Start State (q0):** initial state.
- **Final States (F):** states indicating acceptance.

## Objectives

- Implement a **Grammar class** to represent the given formal grammar.
- Develop a **method to generate valid strings** based on production rules.
- Convert the **Grammar into a Finite Automaton**.
- Implement a **Finite Automaton class** to check string membership.
- Validate implementation.

## Implementation Description

### **Grammar Class**

The `Grammar` class represents the formal grammar with **non-terminals, terminals, production rules, and a start symbol**. The method `generateString()` produces valid words by applying production rules randomly.

```javascript
class Grammar {
  generateString() {
    let current = this.S;
    let result = "";
    while (this.P[current]) {
      let nextRule =
        this.P[current][Math.floor(Math.random() * this.P[current].length)];
      result += nextRule.replace(/[A-Z]/g, "");
      let nextNonTerminal = nextRule.match(/[A-Z]/);
      if (nextNonTerminal) {
        current = nextNonTerminal[0];
      } else {
        break;
      }
    }
    return result;
  }
}
```

### **Finite Automaton Class**

The `FiniteAutomaton` class converts the grammar into an FA and checks whether a given string belongs to the language using state transitions.

```javascript
class FiniteAutomaton {
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
```

## **Conclusions & Results**

- Successfully implemented a **Grammar class** to represent formal grammars.
- **Generated valid strings** using production rules.
- Converted the **Grammar to a Finite Automaton**.
- Validated strings through **state transitions** in the automaton.

### **Sample Output:**

```
Generated strings:
Generated strings:
dab
bbdb
dada
bdb
bbdb
Does 'ba' belong to the language? false
Does 'dba' belong to the language? false
```

## **References**

- Course materials on Formal Languages & Finite Automata.
