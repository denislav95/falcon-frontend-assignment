import { DIRECTIONS, AXIS, Matrix } from './matrix';

declare var $;

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
