# 8-Puzzle AI Solver — Concepts Explained

---

## About the App

**8-Puzzle AI Solver** is an interactive web app where you can play the classic sliding tile puzzle — or let the AI solve it for you. Choose from themed image presets (Kitty, Bambi, Dumbo), upload your own photo, or play with numbered tiles. The app tracks your moves, times you, and keeps a leaderboard of top scores. Hit **AI Solve** and watch the AI animate the optimal solution step by step.

---

## The 8-Puzzle Problem

The 8-puzzle is a classic **Artificial Intelligence** problem. It is a **3×3 grid** with tiles numbered 1–8 and one blank space. The goal is to slide the tiles until they reach the correct order.

```
Start State:         Goal State:
┌───┬───┬───┐        ┌───┬───┬───┐
│ 5 │ 1 │ 3 │        │ 1 │ 2 │ 3 │
├───┼───┼───┤   →    ├───┼───┼───┤
│ 4 │   │ 2 │        │ 4 │ 5 │ 6 │
├───┼───┼───┤        ├───┼───┼───┤
│ 7 │ 8 │ 6 │        │ 7 │ 8 │   │
└───┴───┴───┘        └───┴───┴───┘
```

The challenge: find the **shortest sequence of moves** to reach the goal.

---

## A* Search Algorithm

**A* (A-star)** is the AI algorithm that automatically solves the puzzle. It is one of the most widely used algorithms in AI — found in GPS navigation, robotics, and video game pathfinding.

### The Key Formula

```
f(n) = g(n) + h(n)
```

| Symbol | Meaning |
|--------|---------|
| `g(n)` | Number of moves already made (actual cost so far) |
| `h(n)` | Estimated moves still needed (heuristic guess) |
| `f(n)` | Total estimated cost — **lower is better** |

### How It Works

1. Start from the initial puzzle state.
2. Always explore the state with the **lowest f(n)** first.
3. Keep expanding states until the **goal is found**.
4. Backtrack through parent nodes to reconstruct the **optimal path**.

> A* is **guaranteed to find the shortest solution**, as long as the heuristic never overestimates. This property is called **admissibility**.

---

## Heuristics

A **heuristic** is an intelligent estimate of how far the current state is from the goal. Without one, the AI would search blindly. A good heuristic makes A* fast and focused.

This project supports two heuristics:

### 1. Manhattan Distance *(Recommended)*

> *"How far does each tile need to travel to reach its correct position?"*

For every tile, count the number of rows + columns it needs to move — then add them all up.

```
Tile 5 is at position (0,0), its goal is (1,1)
Distance = |0-1| + |0-1| = 2 steps
```

- Strong — gives a very accurate estimate
- Admissible — never overestimates
- Preferred — explores fewer states, finds solution faster

### 2. Hamming Distance

> *"How many tiles are NOT in their correct position?"*

Simply count the number of misplaced tiles (ignoring the blank).

```
If 3 tiles are in the wrong position → Hamming = 3
```

- Admissible — never overestimates
- Weaker — less informative, leads to exploring more states

### Comparison

| Heuristic | Accuracy | Speed | Best For |
|-----------|----------|-------|----------|
| Manhattan | High | Faster | General use |
| Hamming | Low | Slower | Learning / comparison |

---

## Solvability

**Not every tile arrangement is solvable.** Roughly half of all random shuffles lead to a dead end.

The AI checks this using a concept called **inversions** — a pair of tiles is an inversion when a higher-numbered tile appears before a lower-numbered tile in the flat array.

> **Rule:** A 3×3 puzzle is solvable if and only if the number of inversions is **even**.

The app only ever generates puzzles that are guaranteed to be solvable.

---

## Why A* vs. Other Algorithms?

| Algorithm | Strategy | Finds Shortest Path? | Speed |
|-----------|----------|----------------------|-------|
| BFS (Breadth-First Search) | Explores all states level by level | Yes | Very slow |
| DFS (Depth-First Search) | Goes deep before exploring wide | Not guaranteed | Risky |
| **A*** | Uses heuristic to focus the search | Yes | Fast |

A* is the **gold standard** for single-agent pathfinding problems like the 8-puzzle.

---
> **In short:** This app uses **A* Search** — a powerful AI algorithm — to find the optimal solution to the 8-puzzle. The choice of **heuristic** (Manhattan vs. Hamming) directly affects how intelligently and quickly the AI solves the puzzle.
