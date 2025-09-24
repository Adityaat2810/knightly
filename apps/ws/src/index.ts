import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import url from 'url'
import { extractAuthUser } from './auth';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager()

wss.on('connection', function connection(ws, req){

  const token:
    string | string[] |  undefined
   = url.parse(req.url !!, true).query.token;

  if(token){
    const user  =  extractAuthUser(token as string , ws);
    // Add to game manager
    gameManager.addUser(user);
  }

  ws.on("disconnect", ()=> gameManager.removeUser(ws))
})