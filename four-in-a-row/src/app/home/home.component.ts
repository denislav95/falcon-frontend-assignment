import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import { createClient } from '../../../lib/websocketConnector';
import { generateMatrixModel, Matrix } from '../../../lib/game-utilities/matrix';
import { checkFour } from '../../../lib/game-utilities/check-four';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('dialog') dialog: ElementRef;

  private connection: any;
  private client: any;
  private pinging: any;
  private channel: any;

  private board: Matrix;
  private rows: number = 6;
  private cols: number = 7;
  private playerOne:number = 1;
  private playerTwo:number = 2;
  private currentPlayer: number = this.playerOne;
  private myPlayer: number = this.playerOne;
  private winner: number = 0;
  private username: string = '';
  private gameName: string = '';
  private games: any = [];
  private selectedGame: string = '';
  private users: any = [];
  private gameStarted: boolean = false;
  private pieces: any = [];

  constructor() { }

  addPiece(colIndex) {
    if (this.gameStarted) {

      if (this.currentPlayer === this.myPlayer) {

        const cell = this.findLastEmptyCell(colIndex);

        if (!this.winner) {
          this.board[colIndex][cell] = this.currentPlayer;
        }

        const winner = checkFour(this.currentPlayer, this.board, [colIndex, cell]);

        if (!winner) {
          this.currentPlayer = this.currentPlayer == this.playerOne ? this.playerTwo : this.playerOne;
          this.channel.send({type: 'UPDATE_BOARD', payload: { board: this.board, winner: this.winner }});
        } else {
          this.winner = winner.playerId;
          this.pieces = winner.pieces;
          this.channel.send({type: 'UPDATE_BOARD', payload: { board: this.board, winner: winner.playerId, pieces: winner.pieces }});
        }
      } else {
        alert('It\'s not your turn!');
      }

    } else {
      alert('Game has not begun yet!');
    }

    this.channel.send({type: 'CURRENT_PLAYER', payload: { currentPlayer: this.currentPlayer }});
  }

  findLastEmptyCell(colIndex) {
    const col = this.board[colIndex];

    for (let i = col.length; i >= 0; i--) {
      const cell = col[i];
      if (cell === 0) {
        return i;
      }
    }

    return null;
  }

  startGame() {
    this.channel.send({type: 'START_GAME', payload: {}});
  }

  restartGame() {
    this.board = generateMatrixModel(this.cols, this.rows);
    this.currentPlayer = this.playerOne;
    this.winner = 0;
    this.channel.send({type: 'UPDATE_BOARD', payload: { board: this.board,  winner: -1 }});
  }

  createChannel(gameName) {
    if(gameName) this.gameName = gameName;
    this.channel = this.connection.join(this.gameName);

    this.channel.downstream.subscribe({
      next: ({data}) => {

        if (data.error) {
          console.log('# Something went wrong', data.error);
          return;
        }

        if (data.type == 'START_GAME') {
          this.gameStarted = data.message;
        }

        if (data.type == 'CURRENT_PLAYER') {
          this.currentPlayer = data.message.currentPlayer;
        }

        if (data.type == 'UPDATE_BOARD') {
          this.board = data.message.board;

          if (data.message.winner < 0) {
            this.winner = 0;
            return;
          }

          if (data.message.winner) {
            this.pieces = data.message.pieces;
            this.winner = data.message.winner;
            this.currentPlayer = data.message.winner;
          }
        }

        if (data.type == 'GET_CHANNELS') {
          this.games = data.message.filter(game => game !== this.gameName);
          this.users = data.channel.users;
        }
      },
      error: err => console.log('# Something went wrong', err),
      complete: () => console.log('# Complete')
    });
  }

  joinGame() {
    this.dialog.nativeElement.showModal();
  }

  joinUser() {
      this.channel.leave();
      this.createChannel(this.selectedGame);
      this.dialog.nativeElement.close();
      this.myPlayer = this.playerTwo;
  }

  ngOnInit() {
    this.board = generateMatrixModel(this.cols, this.rows);
    this.client = createClient('localhost', 4000);
    let timestamp = new Date().getTime();
    this.gameName = 'game_' + timestamp;
    this.username = 'user_' + timestamp;
    this.connection = this.client.connect({ name: this.username });
    this.createChannel(this.gameName);
    this.channel.send({type: 'GET_CHANNELS', payload: {}})
    // Ping other connected clients every 5 sec.
    this.pinging = setInterval(() => {
      this.channel.send({type: 'GET_CHANNELS', payload: {}})
    }, 5000);


  }

  ngOnDestroy() {
    if (this.channel) {
      this.channel.leave();
      clearInterval(this.pinging);
    }
  }
}
