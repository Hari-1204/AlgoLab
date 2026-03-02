export const PRESET_GRAPHS = {
  default:   "0:1,2 1:3,4 2:5 3: 4: 5:",
  linear:    "0:1 1:2 2:3 3:4 4:",
  star:      "0:1,2,3,4 1: 2: 3: 4:",
  cycle:     "0:1,4 1:2 2:3 3:4 4:0",
  dense:     "0:1,2,3 1:2,4 2:5 3:4 4:5 5:",
  shortest:  "0:1,2 1:3 2:3,4 3:5 4:5 5:",
};

export const GRAPH_ALGO_IDS  = new Set(["bfs","dfs","bfs-shortest"]);
export const GRID_ALGO_IDS   = new Set(["number-of-islands"]);
export const BOARD_ALGO_IDS  = new Set(["n-queens"]);
export const DP_ALGO_IDS     = new Set(["coin-change"]);
export const STRING_ALGO_IDS = new Set(["sliding-window"]);
export const TWOSUM_IDS      = new Set(["two-sum-brute","two-sum-hash"]);