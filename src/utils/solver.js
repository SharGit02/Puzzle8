/**
 * =====================================================
 * A* SEARCH ALGORITHM FOR 8-PUZZLE
 * =====================================================
 * 
 * The 8-puzzle is a 3x3 grid with tiles 1-8 and one blank.
 * Goal: reach the solved state [1,2,3,4,5,6,7,8,0].
 *
 * A* uses: f(n) = g(n) + h(n)
 *   g(n) = cost from start to current node (# of moves)
 *   h(n) = heuristic estimate to goal (Manhattan or Hamming)
 */

// ----- Min-Heap (Priority Queue) -----
class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() {
    return this.heap.length;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].f <= this.heap[i].f) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].f < this.heap[smallest].f) smallest = l;
      if (r < n && this.heap[r].f < this.heap[smallest].f) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

// ----- Heuristics -----

/**
 * Manhattan Distance: sum of |row_current - row_goal| + |col_current - col_goal|
 * for each non-blank tile. This is admissible (never overestimates).
 */
export function manhattanDistance(state) {
  let dist = 0;
  for (let i = 0; i < 9; i++) {
    const val = state[i];
    if (val === 0) continue; // skip blank
    const goalRow = Math.floor((val - 1) / 3);
    const goalCol = (val - 1) % 3;
    const curRow  = Math.floor(i / 3);
    const curCol  = i % 3;
    dist += Math.abs(curRow - goalRow) + Math.abs(curCol - goalCol);
  }
  return dist;
}

/**
 * Hamming Distance: number of tiles not in their goal position.
 * Also admissible but weaker than Manhattan.
 */
export function hammingDistance(state) {
  let count = 0;
  for (let i = 0; i < 9; i++) {
    if (state[i] !== 0 && state[i] !== i + 1) count++;
  }
  return count;
}

// ----- State Utilities -----

export const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export function isGoal(state) {
  return state.every((v, i) => v === GOAL_STATE[i]);
}

export function stateToKey(state) {
  return state.join(',');
}

/** Get valid neighbor states from swapping blank with adjacent tiles */
export function getNeighbors(state) {
  const blankIdx = state.indexOf(0);
  const row = Math.floor(blankIdx / 3);
  const col = blankIdx % 3;
  const moves = [];

  // Up, Down, Left, Right from blank's perspective
  const directions = [
    { dr: -1, dc: 0 },
    { dr:  1, dc: 0 },
    { dr:  0, dc: -1 },
    { dr:  0, dc:  1 },
  ];

  for (const { dr, dc } of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
      const swapIdx = nr * 3 + nc;
      const newState = [...state];
      [newState[blankIdx], newState[swapIdx]] = [newState[swapIdx], newState[blankIdx]];
      moves.push({ state: newState, movedTile: state[swapIdx] });
    }
  }
  return moves;
}

// ----- A* Solver -----

/**
 * Runs A* search from `startState` to GOAL_STATE.
 * Returns { path, nodesExplored, timeTaken } or null if unsolvable.
 *
 * @param {number[]} startState - Array of 9 values (0 = blank)
 * @param {'manhattan'|'hamming'} heuristic
 */
export function solveAStar(startState, heuristic = 'manhattan') {
  const hFn = heuristic === 'hamming' ? hammingDistance : manhattanDistance;

  if (isGoal(startState)) return { path: [startState], nodesExplored: 0, timeTaken: 0 };

  const startTime = performance.now();

  const openSet = new MinHeap();
  // visited maps stateKey -> best g cost seen
  const visited = new Map();

  const startNode = {
    state: startState,
    g: 0,
    h: hFn(startState),
    f: hFn(startState),
    parent: null,
  };

  openSet.push(startNode);
  visited.set(stateToKey(startState), 0);

  let nodesExplored = 0;

  while (openSet.size > 0) {
    const current = openSet.pop();
    nodesExplored++;

    if (isGoal(current.state)) {
      // Reconstruct path
      const path = [];
      let node = current;
      while (node) {
        path.unshift(node.state);
        node = node.parent;
      }
      const timeTaken = performance.now() - startTime;
      return { path, nodesExplored, timeTaken };
    }

    // Safety limit to avoid browser freeze on very deep searches
    if (nodesExplored > 200000) {
      return null; // unsolvable or too deep
    }

    for (const { state: neighborState } of getNeighbors(current.state)) {
      const g = current.g + 1;
      const key = stateToKey(neighborState);
      if (visited.has(key) && visited.get(key) <= g) continue;
      visited.set(key, g);
      const h = hFn(neighborState);
      openSet.push({
        state: neighborState,
        g,
        h,
        f: g + h,
        parent: current,
      });
    }
  }

  return null; // No solution found
}

// ----- Solvability & Shuffle -----

/**
 * Count inversions: an inversion is when a larger tile appears
 * before a smaller tile in the flattened array (ignoring blank).
 * A puzzle is solvable iff inversions count is even.
 */
export function countInversions(state) {
  const tiles = state.filter(v => v !== 0);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  return inversions;
}

export function isSolvable(state) {
  return countInversions(state) % 2 === 0;
}

/** Generate a random solvable puzzle state */
export function generateSolvableState() {
  let state;
  do {
    state = [...GOAL_STATE].sort(() => Math.random() - 0.5);
  } while (!isSolvable(state) || isGoal(state));
  return state;
}

/** Check if a tile move is valid given current state */
export function isValidMove(state, tileIndex) {
  const blankIdx = state.indexOf(0);
  const tileRow = Math.floor(tileIndex / 3);
  const tileCol = tileIndex % 3;
  const blankRow = Math.floor(blankIdx / 3);
  const blankCol = blankIdx % 3;
  return Math.abs(tileRow - blankRow) + Math.abs(tileCol - blankCol) === 1;
}

/** Apply a move: swap tile at tileIndex with blank */
export function applyMove(state, tileIndex) {
  const blankIdx = state.indexOf(0);
  const newState = [...state];
  [newState[blankIdx], newState[tileIndex]] = [newState[tileIndex], newState[blankIdx]];
  return newState;
}
