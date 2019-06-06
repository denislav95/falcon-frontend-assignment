import { expect } from 'chai';
import { generateMatrixModel } from './matrix';
import { checkFour, WinningMove } from './check-four';

const checkForPlayerOne = (board, move) => checkFour(1, board, move);
const checkForPlayerTwo = (board, move) => checkFour(2, board, move);

describe('Check for a winner move', () => {
  context('- initial game state', () => {
    it('has no winning move', () => {
      const board = generateMatrixModel(6, 7);
      const noWinner = board.every((col, colIndex) => col.every((row) => {
        return !(checkForPlayerOne(board, [colIndex, row])
               || checkForPlayerTwo(board, [colIndex, row]));
      }));
      expect(noWinner).to.be.true;
    });
  });

  context('- non-winning move', () => {
    it('returns null if last move is the very first move', () => {
      const board = generateMatrixModel(6, 7);
      board[0][0] = 1; // <- simulate move by player one
      const lastMove = [0, 0];
      expect(checkForPlayerOne(board, lastMove)).to.be.null;
    });

    it('returns null if last move in a row is blocked by another player', () => {
      const board = generateMatrixModel(6, 7);
      board[0][0] = 1;
      board[0][1] = 1;
      board[0][2] = 2; // <- simulating another player
      board[0][3] = 1;
      const lastMove = [3, 0];
      expect(checkForPlayerOne(board, lastMove)).to.be.null;
    });

    it('returns null if last move in a column is blocked by another player', () => {
      const board = generateMatrixModel(6, 7);
      board[0][0] = 1;
      board[1][0] = 1;
      board[2][0] = 2; // <- simulating another player
      board[3][0] = 1;
      const lastMove = [0, 3];
      expect(checkForPlayerOne(board, lastMove)).to.be.null;
    });

    it('returns null if last move in a diagonal line is blocked by another player', () => {
      const board = generateMatrixModel(6, 7);
      board[0][0] = 1;
      board[1][1] = 1;
      board[2][2] = 2; // <- simulating another player
      board[3][3] = 1;
      const lastMove = [3, 3];
      expect(checkForPlayerOne(board, lastMove)).to.be.null;
    });
  });

  context('- winning move', () => {
    it('works with columns', () => {
      const board = generateMatrixModel(6, 7);
      // simulate winning move by player one
      board[0][0] = 1;
      board[0][1] = 1;
      board[0][2] = 1;
      board[0][3] = 1;
      const lastMove = [3, 0];
      expect(checkForPlayerOne(board, lastMove)).to.be.instanceof(WinningMove);
    });

    it('works with rows', () => {
      const board = generateMatrixModel(6, 7);
      // simulate winning move by player one
      board[0][0] = 1;
      board[1][0] = 1;
      board[2][0] = 1;
      board[3][0] = 1;
      const lastMove = [0, 3];
      expect(checkForPlayerOne(board, lastMove)).to.be.instanceof(WinningMove);
    });

    it('works with diagonal lines', () => {
      const board = generateMatrixModel(6, 7);
      // simulate winning move by player one
      board[0][0] = 1;
      board[1][1] = 1;
      board[2][2] = 1;
      board[3][3] = 1;
      const lastMove = [3, 3];
      expect(checkForPlayerOne(board, lastMove)).to.be.instanceof(WinningMove);
    });
  });
});
