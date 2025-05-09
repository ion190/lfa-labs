class Grammar {
  constructor(Vn, Vt, productions, start) {
    this.Vn = new Set(Vn);
    this.Vt = new Set(Vt);
    this.start = start;

    this.productions = {};
    Vn.forEach((nt) => (this.productions[nt] = new Set()));
    for (let [LHS, rhss] of Object.entries(productions)) {
      for (let rhs of rhss) {
        const arr = rhs === "ε" ? [] : rhs.split("");
        this.productions[LHS].add(arr);
      }
    }
  }

  _print(title) {
    console.log(`\n${title}`);
    Array.from(this.Vn)
      .sort()
      .forEach((nt) => {
        const rhss = Array.from(this.productions[nt])
          .map((r) => (r.length ? r.join("") : "ε"))
          .join(" | ");
        console.log(`${nt} → ${rhss || "∅"}`);
      });
  }

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

    if (nullable.has(this.start)) {
      newP[this.start].add([]);
    }

    this.productions = newP;
    this._print("1. After eliminating ε-productions");
  }

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

    this.productions = newP;
    this._print("2. After eliminating unit productions");
  }

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
    this._print("3. After eliminating inaccessible symbols");
  }

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
    this._print("4. After eliminating non-productive symbols");
  }

  convertToCNF() {
    // 5a) introduce T_x for each terminal
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
    this._print("5a. After replacing terminals with nonterminals");

    // 5b) break long RHS into binary chains
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

    this._print("5b. After breaking down into CNF");
  }
}

const G = new Grammar(
  ["S", "A", "B", "C", "D"],
  ["a", "b"],
  {
    S: ["AC", "bA", "B", "aA"],
    A: ["ε", "aS", "ABab"],
    B: ["a", "bS"],
    C: ["abC"],
    D: ["AB"],
  },
  "S"
);

G._print("Original Grammar");
G.eliminateEpsilon();
G.eliminateUnit();
G.eliminateInaccessible();
G.eliminateNonProductive();
G.convertToCNF();
