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

  constructor() { }

  addPiece(colIndex) {

    if (this.gameStarted && this.currentPlayer == this.myPlayer) {

      const cell = this.findLastEmptyCell(colIndex);

      const winner = checkFour(this.currentPlayer, this.board, [colIndex, cell]);

      if (!winner) {
        this.currentPlayer = this.currentPlayer == this.playerOne ? this.playerTwo : this.playerOne;
        this.board[colIndex][cell] = this.currentPlayer;
        this.channel.send({type: 'UPDATE_BOARD', payload: { board: this.board }})
      } else {
        this.winner = winner.playerId;
        alert('Game has ended Player ' + winner.playerId + ' has won!')
      }
    } else {
      alert('Game has not begun yet');
    }

    this.channel.send({type: 'CURRENT_PLAYER', payload: { currentPlayer: this.currentPlayer }})
  }

  findLastEmptyCell(colIndex) {
    const col = this.board[colIndex];

    for (let i = 0; i < col.length; i++) {
      const cell = col[i];
      if (cell === 0) {
        return i;
      }
    }

    return null;
  }

  startGame() {
    this.channel.send({type: 'START_GAME', payload: {}})
  }

  createChannel(gameName) {
    if(gameName) this.gameName = gameName
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
          console.log('========= UPDATE_BOARD ==========')
          console.log(data.message.board)
          this.board = data.message.board;
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
    let timestamp = new Date().getTime()
    this.gameName = 'game_' + timestamp
    this.username = 'user_' + timestamp
    this.connection = this.client.connect({ name: this.username });
    this.createChannel(this.gameName)
    // Ping other connected clients every 1 sec.
    this.pinging = setInterval(() => {
      this.channel.send({type: 'GET_CHANNELS', payload: {}})
    }, 1000);
  }

  ngOnDestroy() {
    if (this.channel) {
      this.channel.leave();
      clearInterval(this.pinging);
    }
  }

}
