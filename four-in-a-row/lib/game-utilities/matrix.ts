
export interface Matrix extends Array<number[]> {
  [index: number]: number[];
}

export const generateMatrixModel = (col: number, row: number) : Matrix => {
  return Array(col).fill(null).map(() => Array(row).fill(0));
};

export const AXIS = ['↖', '↓', '↑', '↗', '←', '→'];
export const DIRECTIONS = {
  // NW
  '↖': {
    opposite: '↘',
    row: -1, // Row up
    col: -1 // Col left
  },
  // N
  '↑': {
    opposite: '↓',
    row: -1, // Row up
    col: 0  // Col same
  },
  // NE
  '↗': {
    opposite: '↙',
    row: -1, // Row up
    col: 1  // Col Right
  },

  // W
  '←': {
    opposite: '→',
    row: 0, // Row same
    col: -1 // Col left
  },
  // E
  '→': {
    opposite: '←',
    row: 0, // Row same
    col: 1  // Col right
  },

  // SW
  '↙': {
    opposite: '↗',
    row: 1, // Row down
    col: -1 // Col left
  },
  // S
  '↓': {
    opposite: '↑',
    row: 1, // Row down
    col: 0  // Col same
  },
  // SE
  '↘': {
    opposite: '↖',
    row: 1, // Row down
    col: 1  // Col right
  }
};
