import { DIRECTIONS, AXIS, Matrix } from './matrix';

declare var $;
let matchReq =  4;
let numCols =  7;
let numRows = 6;
let winningPieces = {};

export class WinningMove {
  playerId: number;
  pieces: number[][];

  constructor(details) {
    Object.assign(this, details);
  }

  static create(details) {
    return new WinningMove(details);
  }
}

export function checkFour(playerId: number, board: Matrix, [col, row]: number[]) {
  // checks all main 4 directions
  return AXIS.reduce((acc, direction) => {
    return followDirection(board, col, row, direction, playerId) || acc;
  }, null);
}
function followDirection(board, col, row, direction, playerId, pieces = [], reversed = false) {
  const currentPieces = [[col, row], ...pieces];

  // console.log(board);
  // console.log([col, row]);

  // if this is the 4th piece, stop
  if (currentPieces.length === 4) {
    return WinningMove.create({
      playerId,
      pieces: currentPieces
    });
  }
  // Compute next potential piece
  const nextPieceCol = col + DIRECTIONS[direction].col;
  const nextPieceRow = row + DIRECTIONS[direction].row;

  // Check if potential piece is valid
  const notOnBoard = board[nextPieceRow] === undefined
                     || board[nextPieceRow][nextPieceCol] === undefined;

  // If hit edge, reverse
  // If on second run, don't reverse directions
  if (!reversed && (notOnBoard || (playerId !== board[nextPieceRow][nextPieceCol]))) {
    const oppositeDirection = DIRECTIONS[direction].opposite;
    followDirection(board, col, row, oppositeDirection, playerId, [], true);
    return null;
  }

  // Stop computing if not on board
  if (notOnBoard) {
    return null;
  }

  const nextPiecePlayerId = board[nextPieceRow][nextPieceCol];
  // if this piece is the same, check the next on same direction
  if (nextPiecePlayerId === playerId) {
    return followDirection(
            board,
            nextPieceCol,
            nextPieceRow,
            direction,
            playerId,
            currentPieces,
            reversed
          );
  }
}

export function isWinner(grid) {
  return isHorizontal(grid) || isVertical(grid) || isDiagonal(grid);
}

function isDiagonal(grid) {
  return isTopRight(grid) || isTopLeft(grid);
}

/**
 * Found in top right?
 * @param  {Array}  grid
 *
 * @return {Boolean}
 */
function isTopLeft(grid) {

  let found;
  let foundPiece;
  let col;

  // Here, we take successive diagonals, defined by the location of their
  // "base", meaning the column where they meet the ground.
  // The initial baseCol is a negative number, representing that the diagonal
  // starts off the board. These diagonals intersect the board, nonetheless.
  for (
    let baseCol = matchReq - numRows;
    baseCol < numCols - (matchReq - 1);
    baseCol++
  ) {

    found = 0;
    foundPiece = 0;
    col = baseCol - 1; // Subtracting 1 to compensate for incrementing col at
                       // the beginning of the loop

    // Here we work our way *UP* the current diagonal
    for (let row = 0; row < numRows; row++) {
      col++;

      // Ensure that the given column and row are on the board
      if (col >= 0 && col < numCols && row < numRows) {

        let piece = grid[col][row];

        if(!piece) {
          found = 0;
        }

        if (!!piece && (piece === foundPiece || !foundPiece) && (++found) === matchReq) {
          console.log('diagonal top left')
          return true;
        }

        foundPiece = piece;

      }
    }
  }

  return false;
}


/**
 * Are there any diagonal matches from top left?
 * @param  {Array}  grid
 *
 * @return {Boolean}
 */
function isTopRight(grid) {

  let found;
  let foundPiece;
  let col;

  // Here, we take successive diagonals, defined by the location of their "base",
  // meaning the column where they meet the ground.
  // The initial baseCol is a negative number, representing that the diagonal starts off
  // the board. These diagonals intersect the board, nonetheless.
  for (
    let baseCol = matchReq - numRows;
    baseCol < numCols - (matchReq - 1);
    baseCol++
  ) {

    found = 0;
    foundPiece = 0;
    col = baseCol - 1; // Subtracting 1 to compensate for incrementing col at
                       // the beginning of the loop

    // Here we work our way *DOWN* the current diagonal
    for (let row = numRows - 1; row >= 0; row--) {
      col++;

      // Ensure that the given column and row are on the board
      if (col >= 0 && col < numCols && row < numRows) {

        let piece = grid[col][row];

        if(!piece) {
          found = 0;
        }

        if (!!piece && (piece === foundPiece || !foundPiece) && (++found) === matchReq) {
          console.log('diagonal top right')
          return true;
        }

        foundPiece = piece;

      }
    }
  }

  return false;
}

function isHorizontal(grid) {

  // Number of rows
  const rowsNum = 6;
  const columnsNum = 7;

  // which piece was found and how many
  let found = 0;
  let foundPiece = 0;

  for (let x = 0; x < rowsNum; x++) {
    for (let y = 0; y < columnsNum; y++) {

      // Current piece in this row
      let piece = grid[y][x];

      // Reset things if piece is 0
      if (piece === 0) {
        found = 0;
        foundPiece = 0;
        continue;
      }

      if (piece !== foundPiece) {
        found = 1;
        foundPiece = piece;
        continue;
      }

      // Increase number of found pieces
      found++;

      // More than 4 found pieces in a piece?
      if (found >= 4) {
        console.log('horizontal')
        return true;
      }
    }
  }

  // nothing was found in the same row
  return false;
}

function isVertical(grid) {

  let found = 0;
  let foundPiece = 0;

  for (let column of grid) {
    for (let piece of column) {

      // Reset things if piece is 0
      if (piece === 0) {
        found = 0;
        foundPiece = 0;
        continue;
      }

      if (piece !== foundPiece) {
        found = 1;
        foundPiece = piece;
        continue;
      }

      // Increase number of found pieces
      found++;


      console.log(column, piece)

      // More than 4 found pieces in a column?
      if (found >= 4) {
        console.log('vertical')

        return true;
      }
    }
  }

  // nothing was found in the same row
  return false;
}
