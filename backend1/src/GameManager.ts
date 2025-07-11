import { WebSocket } from "ws";
import { INIT_GAME } from "./messages";
import { Game } from "./Game";


export class GameManager{

    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];


    constructor(){
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket){
        this.users.push(socket)
        this.addHandler(socket)
    }

    removeUser(socket:WebSocket){
        this.users = this.users.filter(user => user != socket)
        // stop game here as user left
    }

    private addHandler(socket: WebSocket){
        socket.on('message', (data)=>{
            const message = JSON.parse(data.toString())
            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    // if pending user ==> pair current user with him
                    const game = new Game(this.pendingUser, socket)
                    this.games.push(game)
                    this.pendingUser = null
                }else{
                    // if no pending user make current pending
                    this.pendingUser = socket
                } 
            }
        })
    }

}