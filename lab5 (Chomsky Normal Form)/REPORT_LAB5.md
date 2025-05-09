# Chomsky Normal Form

### Course: Formal Languages & Finite Automata

### Author: Ion Iamandii

---

## Theory

In formal language theory, a context-free grammar, G, is said to be in Chomsky normal form (first described by Noam Chomsky) if all of its production rules are of the form:

    A → BC,   or
    A → a,   or
    S → ε,

where A, B, and C are nonterminal symbols, the letter a is a terminal symbol (a symbol that represents a constant value), S is the start symbol, and ε denotes the empty string. Also, neither B nor C may be the start symbol, and the third production rule can only appear if ε is in L(G), the language produced by the context-free grammar G.

Every grammar in Chomsky normal form is context-free, and conversely, every context-free grammar can be transformed into an equivalent one which is in Chomsky normal form and has a size no larger than the square of the original grammar's size.

## Objectives:

- Learn about Chomsky Normal Form (CNF)
- Get familiar with the approaches of normalizing a grammar.
- Implement a method for normalizing an input grammar by the rules of CNF.

  a. The implementation needs to be encapsulated in a method with an appropriate signature (also ideally in an appropriate class/type).

  b. The implemented functionality needs executed and tested.

  c. Also, another BONUS point would be given if the student will make the aforementioned function to accept any grammar, not only the one from the student's variant.

## Implementation description

### **eliminateEpsilon() method**

This function breaks down a regex string into manageable components (groups or literals) along with their quantifiers (\*, +, {n}).

### How it Works:

This function removes all ε-productions (rules of the form A -> ε) from the grammar.

### How it Works:

1. **Nullable Identification**

   - The algorithm finds all non-terminals that can derive ε (directly or indirectly).

2. **Production Update**

   - For each production containing nullable symbols, new productions are generated with all combinations of omitting those nullable symbols (excluding the case where all are omitted unless allowed).

3. **ε-Rule Removal**
   - All ε-productions are then removed from the grammar, except if the start symbol can derive ε, in which case a special handling may be preserved.

```javascript
  eliminateEpsilon() {
    const nullable = new Set();
    let changed;
    do {
      changed = false;
      for (let A of this.Vn) {
        for (let rhs of this.productions[A]) {
          if (!nullable.has(A)) {
            if (rhs.length === 0 || rhs.every((sym) => nullable.has(sym))) {
              nullable.add(A);
              changed = true;
            }
          }
        }
      }
    } while (changed);

    const newP = {};
    this.Vn.forEach((A) => (newP[A] = new Set()));
    for (let A of this.Vn) {
      for (let rhs of this.productions[A]) {
        if (rhs.length > 0) newP[A].add(rhs);

        const idxs = rhs
          .map((sym, i) => (nullable.has(sym) ? i : -1))
          .filter((i) => i >= 0);
        const subsets = [[]];
        for (let i of idxs) {
          const len = subsets.length;
          for (let j = 0; j < len; j++) {
            subsets.push(subsets[j].concat(i));
          }
        }
        for (let sub of subsets) {
          if (!sub.length) continue;
          const filtered = rhs.filter((_, i) => !sub.includes(i));
          if (filtered.length > 0) {
            newP[A].add(filtered);
          }
        }
      }
    }
  }
```

### **eliminateUnit() method**

This function removes all unit productions (rules like \( A \rightarrow B \)) where both A and B are non-terminals.

### How it Works:

1. **Unit Pair Detection**

   - For each non-terminal, the algorithm finds all other non-terminals reachable through chains of unit productions.

2. **Production Expansion**

   - The productions of each reachable non-terminal are copied to the original one, effectively replacing indirect derivations.

3. **Unit Rule Removal**
   - All original unit productions are eliminated after their replacements are added.

```javascript
  eliminateUnit() {
    const unitClos = {};
    for (let A of this.Vn) {
      const Q = [A],
        reach = new Set([A]);
      while (Q.length) {
        const B = Q.pop();
        for (let rhs of this.productions[B]) {
          if (rhs.length === 1 && this.Vn.has(rhs[0]) && !reach.has(rhs[0])) {
            reach.add(rhs[0]);
            Q.push(rhs[0]);
          }
        }
      }
      unitClos[A] = reach;
    }

    const newP = {};
    for (let A of this.Vn) {
      newP[A] = new Set();
      for (let B of unitClos[A]) {
        for (let rhs of this.productions[B]) {
          if (!(rhs.length === 1 && this.Vn.has(rhs[0]))) {
            newP[A].add(rhs);
          }
        }
      }
    }
  }
```

### **eliminateInaccessible() method**

This function removes all symbols (both terminals and non-terminals) that cannot be reached from the start symbol.

### How it Works:

1. **Reachability Analysis**

   - Starting from the start symbol, the algorithm traverses productions and marks every reachable non-terminal.

2. **Pruning**
   - All productions and symbols not marked as reachable are removed from the grammar.

```javascript
  eliminateInaccessible() {
    const visited = new Set([this.start]),
      stack = [this.start];
    while (stack.length) {
      const A = stack.pop();
      for (let rhs of this.productions[A]) {
        for (let sym of rhs) {
          if (this.Vn.has(sym) && !visited.has(sym)) {
            visited.add(sym);
            stack.push(sym);
          }
        }
      }
    }
    this.Vn = visited;
    const newP = {};
    visited.forEach((A) => (newP[A] = this.productions[A]));
    this.productions = newP;
  }
```

### **eliminateNonProductive() method**

This function removes non-terminals that do not derive any terminal string (non-productive symbols).

### How it Works:

1. **Productivity Identification**

   - It first finds all non-terminals that can eventually derive terminal strings (i.e., whose productions consist only of terminals or productive non-terminals).

2. **Filtering**
   - Any rules containing non-productive symbols are discarded from the grammar.

```javascript
  eliminateNonProductive() {
    const prod = new Set(),
      iterProds = () =>
        Array.from(this.Vn).map((A) => [A, this.productions[A]]);
    let changed;
    do {
      changed = false;
      for (let [A, rhss] of iterProds()) {
        if (!prod.has(A)) {
          for (let rhs of rhss) {
            if (rhs.every((sym) => this.Vt.has(sym) || prod.has(sym))) {
              prod.add(A);
              changed = true;
              break;
            }
          }
        }
      }
    } while (changed);

    this.Vn = prod;
    const newP = {};
    prod.forEach((A) => {
      newP[A] = new Set(
        Array.from(this.productions[A]).filter((rhs) =>
          rhs.every((sym) => this.Vt.has(sym) || prod.has(sym))
        )
      );
    });
    this.productions = newP;
  }
```

### **convertToCNF() method**

This function transforms the cleaned grammar into **Chomsky Normal Form**.

### How it Works:

1. **Terminal Isolation**

   - In mixed rules (e.g., A -> aB), terminals are replaced by new non-terminals that map to them: T_a -> a, so A -> T_a B.

2. **Production Binarization**

   - Rules with more than two symbols on the right-hand side are broken into binary rules using helper variables, e.g., A -> BCD becomes A -> B X_1, X_1 -> C D.

3. **Final Structure**
   - Ensures that all productions are of the form:
     - A -> BC (two non-terminals), or
     - A -> a (single terminal).

```javascript
  convertToCNF() {
    const termMap = {};
    for (let t of this.Vt) {
      const T = `T_${t}`;
      termMap[t] = T;
      if (!this.Vn.has(T)) {
        this.Vn.add(T);
      }
      this.productions[T] = new Set([[t]]);
    }

    for (let A of Array.from(this.Vn)) {
      const newRhss = new Set();
      for (let rhs of this.productions[A]) {
        const mapped = rhs.map((sym) =>
          this.Vt.has(sym) ? termMap[sym] : sym
        );
        newRhss.add(mapped);
      }
      this.productions[A] = newRhss;
    }

    let counter = 0;
    for (let A of Array.from(this.Vn)) {
      for (let rhs of Array.from(this.productions[A])) {
        if (rhs.length <= 2) continue;
        this.productions[A].delete(rhs);

        let chain = rhs;
        let curA = A;
        while (chain.length > 2) {
          const [X1, X2, ...rest] = chain;
          const N = `X${counter++}`;
          this.Vn.add(N);
          this.productions[curA].add([X1, X2, N]);
          this.productions[N] = new Set();
          curA = N;
          chain = rest;
        }
        this.productions[curA].add(chain);
      }
    }
  }
```

## Conclusions

Actions Performed:

- **Epsilon Removal**: All ε-productions are removed while preserving language equivalence.
- **Unit Rule Elimination**: Replaced indirect non-terminal references with direct productions.
- **Inaccessible/Non-productive Removal**: Cleaned up symbols that don't contribute to derivations.
- **CNF Conversion**: Transformed the grammar to strictly binary productions or terminal-only.

Difficulties Faced:

- **Combinatorial Explosion**: Generating all subsets of nullable symbols without duplicating rules.
- **Dependency Chains**: Handling unit productions that form deep or circular chains.
- **Grammar Integrity**: Ensuring no valid strings are lost during cleaning.

These functions together transform any context-free grammar into a minimal and normalized form, ready for use in parsing algorithms or automata theory applications.

### **Sample Output:**

```
Original Grammar
A → ε | aS | ABab
B → a | bS
C → abC
D → AB
S → AC | bA | B | aA

1. After eliminating ε-productions
A → aS | ABab | Bab
B → a | bS
C → abC
D → AB | B
S → AC | C | bA | b | B | aA | a

2. After eliminating unit productions
A → aS | ABab | Bab
B → a | bS
C → abC
D → AB | a | bS
S → AC | bA | b | aA | a | abC | a | bS

3. After eliminating inaccessible symbols
A → aS | ABab | Bab
B → a | bS
C → abC
S → AC | bA | b | aA | a | abC | a | bS

4. After eliminating non-productive symbols
A → aS | ABab | Bab
B → a | bS
S → bA | b | aA | a | a | bS

5a. After replacing terminals with nonterminals
A → T_aS | ABT_aT_b | BT_aT_b
B → T_a | T_bS
S → T_bA | T_b | T_aA | T_a | T_a | T_bS
T_a → T_a
T_b → T_b

5b. After breaking down into CNF
A → T_aS | ABX0 | BT_aX1
B → T_a | T_bS
S → T_bA | T_b | T_aA | T_a | T_a | T_bS
T_a → T_a
T_b → T_b
X0 → T_aT_b
X1 → T_b
```

## **References**

- Course materials on Formal Languages & Finite Automata.
