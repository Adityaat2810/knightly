import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {
    public player1: WebSocket
    public player2 : WebSocket
    public board: Chess
    public moves: String[];
    public startTime: Date;

    constructor( player1: WebSocket, player2 : WebSocket){
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date()
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload:{
                color: "white"
            }
        }))

        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'black'
            }
        }))
    }

    makeMove(socket: WebSocket, move: {
        from: string,
        to: string
    }){
        //  validationHere
        //  1. is it this users move
        /**
         * player 1 -- odd move
         * player 2 -- even move
         *
         */

        // even move made ---> player 1 turn now
        if(this.board.moves.length % 2 == 0 && socket !== this.player1){
            return
        }

        // odd move made --> player 2 turn now
        if( this.board.moves.length % 2 != 0 && socket !== this.player2){
            return
        }

        //  2. Is the move valid --> chess.js validate it

        // update the board
        // push the move
        try{
            this.board.move(move)
        }catch(error){
            console.log(error)
            return;
        }

        // check if the game is over
        if(this.board.isGameOver()){
            // send it t both parties
            this.player1.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner : this.board.turn() === 'w' ? 'black': 'white'
                }
            }))
        }

        // send the updated board to both player
        if(this.board.moves.length % 2 === 0){
            // p1 makes move send to p2
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))

        }else{
            // p2 makes move send to p1
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }


    }
}