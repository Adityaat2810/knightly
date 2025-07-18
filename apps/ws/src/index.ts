import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import { User } from './SocketManager';
import { randomUUID } from 'crypto';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager()

wss.on('connection', function connection(ws){
  const guestName = `Guest-${Math.floor(Math.random() * 10000)}`;
  const user = new User(ws, randomUUID(), guestName, true);

  // Add to game manager
  gameManager.addUser(user);
  ws.on("disconnect", ()=> gameManager.removeUser(ws))
})