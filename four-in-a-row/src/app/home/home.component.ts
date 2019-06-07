import { Component, OnInit } from '@angular/core';

import { createClient } from '../../../lib/websocketConnector';
import { generateMatrixModel, Matrix } from '../../../lib/game-utilities/matrix';
import { checkFour } from '../../../lib/game-utilities/check-four';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private board: Matrix;
  private rows: number = 6;
  private cols: number = 7;
  private playerOne:number = 1;
  private playerTwo:number = 2;
  private currentPlayer: number = this.playerOne;
  private winner: number = 0;

  constructor() { }

  addPiece(colIndex) {

    const cell = this.findLastEmptyCell(colIndex);
    const winner = checkFour(this.currentPlayer, this.board, [colIndex, cell]);

    if (!winner) {
      this.currentPlayer = this.currentPlayer == this.playerOne ? this.playerTwo : this.playerOne;
      this.board[colIndex][cell] = this.currentPlayer;
    } else {
      this.winner = winner.playerId;
      alert('Game has ended Player ' + winner.playerId + ' has won!')
    }

    // console.log(cell)
    // console.log(this.board)
    // console.log(this.currentPlayer);

  }

  findLastEmptyCell(colIndex) {
    const cells = this.board[colIndex];

    for (let i = cells.length - 1; i >= 0; i--) {
      const cell = cells[i];
      if (cell === 0) {
        return i;
      }
    }

    return null;
  }

  ngOnInit() {
    this.board = generateMatrixModel(this.cols, this.rows);
//
// // 2) Create a client object
// // -------------------------
// // This will not create a WS connection, but will only
// // return an object that controls the opening and closing
// // of the connection.
//     const client = createClient('localhost', 4000);
//
// // 3) At a later point in the implementation we can use the
// // -------------------------
// // client object to open a connection.
// // I.e we now have an active Websocket open
// // You can pass in an optional meta object that will be attached to all messages,
// // a possible use case is an object identifying the user on the connection.
//     const connection = client.connect({ name: 'George' });
//
// // 4) Join a channel (ch1) and subscribe to downstream messages.
// // -------------------------
// // If a channel does not exist one will be created.
// // The `downstream` object is of type <Observable>
//     const channel = connection.join('ch1');
//     channel.downstream.subscribe({
//       next: ({ data }) => {
//         if (data.error) {
//           console.log('# Something went wrong', data.error);
//           return;
//         }
//         if (data.message === 'ping') {
//           console.log('# Sending pong');
//           channel.send('pong');
//         }
//         if (data.message === 'pong') {
//           console.log('# Received pong', data);
//         }
//       },
//       error: err => console.log('# Something went wrong', err),
//       complete: () => console.log('# Complete')
//     });
//
// // Ping other connected clients every 5 sec.
//     const pinging = setInterval(() => channel.send('ping'), 5000);
//
// // Leave channel after 20 sec.
//     setTimeout(() => {
//       clearInterval(pinging);
//       channel.leave();
//     }, 20000);
//
  }

}
