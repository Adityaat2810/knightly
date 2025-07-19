import { WebSocket } from "ws";
import { EXIT_GAME, GAME_ADDED, GAME_ALERT, GAME_ENDED, GAME_JOINED, GAME_NOT_FOUND, INIT_GAME, JOIN_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import { socketManager, User } from "./SocketManager";
import { db } from "./db";
import { GameStatus } from "@prisma/client";


export class GameManager{

    private games: Game[];
    private pendingGameId: string | null;
    private users: User[];


    constructor(){
      this.games = [];
      this.pendingGameId = null;
      this.users = [];
    }

    async addUser(user: User){
      console.log('Adding user');
      this.users.push(user)
      this.addHandler(user)
    }

    removeUser(socket:WebSocket){
      const user = this.users.find((user) => user.socket === socket);
      if (!user) {
        console.error('User not found?');
        return;
      }
      this.users = this.users.filter((user) => user.socket !== socket);
      socketManager.removeUser(user);
    }

    removeGame(gameId: string){
      this.games = this.games.filter(
        (g)=> g.gameId != gameId
      )
    }

    private addHandler(user: User){
      console.log('Adding handler for user', user.name, user.id);
      user.socket.on('message', async (data)=>{
        const message = JSON.parse(data.toString())
        // Initialize game
        if(message.type === INIT_GAME){
          if(this.pendingGameId){
            console.log('Pending game found, pairing users');
            // if pending user ==> pair current user with him
            const game = this.games.find((x) => x.gameId === this.pendingGameId);
            if (!game) {
              console.error('Pending game not found?');
              return;
            }
            if(user.userId === game.player1UserId){
              socketManager.broadcast(
                game.gameId,
                JSON.stringify({
                  type: GAME_ALERT,
                  payload: {
                    message: 'Trying to Connect with yourself?',
                  }
                })
              )
              return
            }

            console.log('Pairing users');
            socketManager.addUser(user, game.gameId)
            console.log('Updating second player');
            await game?.updateSecondPlayer(user.userId)
            console.log('Game updated with second player');
            this.pendingGameId = null
          }else{
            console.log('Creating new game');
            // if no pending user make current pending
            const game = new Game(user.userId, null)
            this.games.push(game)
            this.pendingGameId = game.gameId
            socketManager.addUser(user, game.gameId)
            socketManager.broadcast(
              game.gameId,
              JSON.stringify({
                type: GAME_ADDED,
                gameId: game.gameId
              })
            )
          }
        }

        // MOVE
        if (message.type === MOVE) {
          const gameId = message.payload.gameId;
          const game = this.games.find((game) => game.gameId === gameId);
          if (game) {
            game.makeMove(user, message.payload.move);
            if (game.result) {
              this.removeGame(game.gameId);
            }
          }

        }

        //  Exit game
        if (message.type === EXIT_GAME){
          const gameId = message.payload.gameId;
          const game = this.games.find((game) => game.gameId === gameId);

          if (game) {
            game.exitGame(user);
            this.removeGame(game.gameId)
          }
        }

        // Join room
        if(message.type === JOIN_GAME){
          console.log('User trying to join game');
          const gameId = message.payload?.gameId
          console.log('Game ID:', gameId);
          if(!gameId) return;

          let availableGame = this.games.find(
            (game)=> game.gameId === gameId
          )
          console.log('Available game found:', availableGame);




          if(availableGame && !availableGame.player2UserId){
            socketManager.addUser(user, availableGame.gameId)
            await availableGame.updateSecondPlayer(user.userId)
            return;
          }


          const gameFromDb = await db.game.findUnique({
            where: { id: gameId },
            include: {
              moves: {
                orderBy: {
                  moveNumber: 'asc',
                },
              },
              blackPlayer: true,
              whitePlayer: true,
            },
          });

          if(!gameFromDb){
            user.socket.send(
              JSON.stringify({
                type: GAME_NOT_FOUND
              })
            )
            return;
          }

          if(gameFromDb.status !== GameStatus.IN_PROGRESS) {
            user.socket.send(JSON.stringify({
              type: GAME_ENDED,
              payload: {
                result: gameFromDb.result,
                status: gameFromDb.status,
                moves: gameFromDb.moves,
                blackPlayer: {
                  id: gameFromDb.blackPlayer.id,
                  name: gameFromDb.blackPlayer.name,
                },
                whitePlayer: {
                  id: gameFromDb.whitePlayer.id,
                  name: gameFromDb.whitePlayer.name,
                },
              }
            }));
            return;
          }

          if (!availableGame) {
            const game = new Game(
              gameFromDb?.whitePlayerId!,
              gameFromDb?.blackPlayerId!,
              gameFromDb.id,
              gameFromDb.startAt,
            );
            game.seedMoves(gameFromDb?.moves || []);
            this.games.push(game);
            availableGame = game;
          }

          console.log(availableGame.getPlayer1TimeConsumed());
          console.log(availableGame.getPlayer2TimeConsumed());

          user.socket.send(
            JSON.stringify({
              type: GAME_JOINED,
              payload: {
                gameId,
                moves: gameFromDb.moves,
                blackPlayer: {
                  id: gameFromDb.blackPlayer.id,
                  name: gameFromDb.blackPlayer.name,
                },
                whitePlayer: {
                  id: gameFromDb.whitePlayer.id,
                  name: gameFromDb.whitePlayer.name,
                },
                player1TimeConsumed: availableGame.getPlayer1TimeConsumed(),
                player2TimeConsumed: availableGame.getPlayer2TimeConsumed(),
              },
            }),
          );

          socketManager.addUser(user, gameId);

        }
      })
    }

}