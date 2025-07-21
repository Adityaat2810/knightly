import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { JOIN_ROOM } from "@/types";

// Message types matching backend
export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const GAME_ENDED = 'game_ended';
export const GAME_JOINED = 'game_joined';
export const GAME_ADDED = 'game_added';
export const GAME_ALERT = 'game_alert';
export const GAME_NOT_FOUND = 'game_not_found';
export const JOIN_GAME = 'join_game';
export const EXIT_GAME = 'exit_game';

interface Player {
  id: string;
  name: string;
  isGuest?: boolean;
}

interface GameMove {
  from: string;
  to: string;
  san?: string;
  before?: string;
  after?: string;
  moveNumber?: number;
  timeTaken?: number;
}

interface GameState {
  gameId: string | null;
  whitePlayer: Player | null;
  blackPlayer: Player | null;
  moves: GameMove[];
  currentTurn: 'w' | 'b';
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIME_UP' | 'PLAYER_EXIT';
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW' | null;
  player1TimeConsumed: number;
  player2TimeConsumed: number;
}

export default function Game() {
  const { socket, connectionStatus } = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    whitePlayer: null,
    blackPlayer: null,
    moves: [],
    currentTurn: 'w',
    status: 'WAITING',
    result: null,
    player1TimeConsumed: 0,
    player2TimeConsumed: 0
  });
  const [joinGameId, setJoinGameId] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Format time from milliseconds to MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message received:", message);

      switch (message.type) {
        case GAME_ADDED:
          setGameState(prev => ({
            ...prev,
            gameId: message.gameId,
            status: 'WAITING'
          }));
          setAlertMessage('Game created! Waiting for opponent...');
          break;

        case INIT_GAME:
          const { gameId, whitePlayer, blackPlayer, fen, moves } = message.payload;
          const newChess = new Chess(fen);
          setChess(newChess);
          setBoard(newChess.board());
          setGameState(prev => ({
            ...prev,
            gameId,
            whitePlayer,
            blackPlayer,
            moves,
            status: 'IN_PROGRESS',
            currentTurn: newChess.turn()
          }));
          setAlertMessage('Game started!');
          break;

        case GAME_JOINED:
          const gameData = message.payload;
          const joinedChess = new Chess();

          // Replay moves
          gameData.moves.forEach((move: any) => {
            try {
              joinedChess.move({ from: move.from, to: move.to });
            } catch (e) {
              console.error('Error replaying move:', e);
            }
          });

          setChess(joinedChess);
          setBoard(joinedChess.board());
          setGameState(prev => ({
            ...prev,
            gameId: gameData.gameId,
            whitePlayer: gameData.whitePlayer,
            blackPlayer: gameData.blackPlayer,
            moves: gameData.moves,
            status: 'IN_PROGRESS',
            currentTurn: joinedChess.turn(),
            player1TimeConsumed: gameData.player1TimeConsumed || 0,
            player2TimeConsumed: gameData.player2TimeConsumed || 0
          }));
          setAlertMessage('Joined game successfully!');
          break;

        case MOVE:
          const { move, player1TimeConsumed, player2TimeConsumed } = message.payload;
          try {
            chess.move(move);
            setBoard(chess.board());
            setGameState(prev => ({
              ...prev,
              moves: [...prev.moves, move],
              currentTurn: chess.turn(),
              player1TimeConsumed,
              player2TimeConsumed
            }));
          } catch (e) {
            console.error('Error making move:', e);
          }
          break;

        case GAME_ENDED:
          const endData = message.payload;
          setGameState(prev => ({
            ...prev,
            status: endData.status,
            result: endData.result
          }));
          setAlertMessage(`Game ended: ${endData.result}`);
          break;

        case GAME_ALERT:
          setAlertMessage(message.payload.message);
          break;

        case GAME_NOT_FOUND:
          setAlertMessage('Game not found!');
          break;

        default:
          console.warn("Unknown message type:", message.type);
      }
    };
  }, [socket, chess]);

  const handleStartGame = () => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: INIT_GAME }));
    setAlertMessage('Creating game...');
  };

  const handleJoinGame = () => {
    if (!socket || !joinGameId.trim()) return;
    socket.send(JSON.stringify({
      type: JOIN_ROOM,
      payload: { gameId: joinGameId.trim() }
    }));
    setAlertMessage('Joining game...');
  };

  const handleExitGame = () => {
    if (!socket || !gameState.gameId) return;
    socket.send(JSON.stringify({
      type: EXIT_GAME,
      payload: { gameId: gameState.gameId }
    }));
    setGameState(prev => ({
      ...prev,
      gameId: null,
      status: 'WAITING',
      whitePlayer: null,
      blackPlayer: null,
      moves: [],
      result: null
    }));
    setChess(new Chess());
    setBoard(new Chess().board());
    setAlertMessage('Exited game');
  };

  const clearAlert = () => {
    setAlertMessage('');
  };

  // Show different messages based on connection status
  if (connectionStatus === 'connecting') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-amber-200 text-xl mb-4">Connecting to server...</div>
          <div className="text-gray-400">Make sure your backend server is running on port 8080</div>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Failed to connect to server</div>
          <div className="text-gray-400 mb-4">
            Please check:
            <ul className="list-disc list-inside mt-2 text-left max-w-md">
              <li>Backend server is running on port 8080</li>
              <li>No firewall blocking the connection</li>
              <li>WebSocket server is properly configured</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-yellow-400 text-xl mb-4">⚠️ Disconnected from server</div>
          <div className="text-gray-400 mb-4">Attempting to reconnect...</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Alert Message */}
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-10 text-lg font-semibold">
          {alertMessage}
          <button
            onClick={clearAlert}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Game Over Banner */}
      {gameState.status !== 'WAITING' && gameState.status !== 'IN_PROGRESS' && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg z-10 text-xl font-semibold">
          Game Over! Result: {gameState.result}
        </div>
      )}

      <div className="flex justify-center p-4">
        <div className="max-w-screen-lg w-full">
          <div className="grid grid-cols-6 gap-4 w-full">
            {/* Chess Board */}
            <div className="col-span-4 w-full flex justify-center">
              <div className="space-y-4">
                {/* Player Info */}
                {gameState.blackPlayer && (
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        {gameState.blackPlayer.name} (Black)
                      </span>
                      <span className="text-amber-200">
                        {formatTime(gameState.player2TimeConsumed)}
                      </span>
                    </div>
                  </div>
                )}

                <ChessBoard
                  chess={chess}
                  setBoard={setBoard}
                  board={board}
                  socket={socket!!}
                  gameId={gameState.gameId}
                  isGameInProgress={gameState.status === 'IN_PROGRESS'}
                />

                {gameState.whitePlayer && (
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        {gameState.whitePlayer.name} (White)
                      </span>
                      <span className="text-amber-200">
                        {formatTime(gameState.player1TimeConsumed)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Game Controls */}
            <div className="col-span-2 bg-slate-800 p-6 rounded-lg">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-center">Game Controls</h2>

                {/* Connection Status */}
                <div className="text-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    connectionStatus === 'connected' ? 'bg-green-600' :
                    connectionStatus === 'connecting' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}>
                    {connectionStatus === 'connected' ? 'Connected' :
                     connectionStatus === 'connecting' ? 'Connecting...' :
                     'Disconnected'}
                  </span>
                </div>

                {/* Game Status */}
                <div className="text-center">
                  <span className="text-sm text-gray-400">Status: </span>
                  <span className="text-amber-200 font-semibold">
                    {gameState.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Game ID Display */}
                {gameState.gameId && (
                  <div className="text-center">
                    <span className="text-sm text-gray-400">Game ID: </span>
                    <span className="text-amber-200 font-mono text-sm">
                      {gameState.gameId}
                    </span>
                  </div>
                )}

                {/* Start New Game */}
                {gameState.status === 'WAITING' && (
                  <Button onClick={handleStartGame}>
                    Start New Game
                  </Button>
                )}

                {/* Join Game */}
                {gameState.status === 'WAITING' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Enter Game ID"
                      value={joinGameId}
                      onChange={(e) => setJoinGameId(e.target.value)}
                      className="w-full p-2 rounded bg-slate-700 text-white placeholder-gray-400"
                    />
                    <Button onClick={handleJoinGame}>
                      Join Game
                    </Button>
                  </div>
                )}

                {/* Exit Game */}
                {gameState.gameId && gameState.status === 'IN_PROGRESS' && (
                  <Button onClick={handleExitGame}>
                    Exit Game
                  </Button>
                )}

                {/* Current Turn Indicator */}
                {gameState.status === 'IN_PROGRESS' && (
                  <div className="text-center">
                    <span className="text-sm text-gray-400">Current Turn: </span>
                    <span className="text-amber-200 font-semibold">
                      {gameState.currentTurn === 'w' ? 'White' : 'Black'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
