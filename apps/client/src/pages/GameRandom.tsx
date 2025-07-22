import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { EXIT_GAME, GAME_ADDED, GAME_ALERT, GAME_ENDED, GAME_JOINED, GameState, INIT_GAME, JOIN_ROOM, MOVE } from "../types";
import { Crown, Clock, Users, Wifi, WifiOff } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";
import { GAME_NOT_FOUND } from "./Game";
import { Connecting } from "@/components/messages/Connecting";
import { ErrorMessage } from "@/components/messages/Error";
import { Disconnected } from "@/components/messages/Disconnected";

// Message types matching backend
export default function GameRandom() {
  const { socket, connectionStatus } = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const navigate = useNavigate();

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

  const user = useUser()

  // Format time from milliseconds to MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(()=>{
    console.log(`HEY`, user)
    if(!user.token){
      navigate('/login')
    }
  },[user])

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
      <Connecting/>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <ErrorMessage/>
    );
  }

  if (connectionStatus === 'disconnected') {
    return (
      <Disconnected/>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-800">Knightly</h1>
          </div>
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting' :
               'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{alertMessage}</span>
            <button
              onClick={clearAlert}
              className="ml-3 text-white hover:text-gray-200 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Game Over Banner */}
      {gameState.status !== 'WAITING' && gameState.status !== 'IN_PROGRESS' && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span className="font-medium">Game Complete: {gameState.result}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Chess Board Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6">

              {/* Black Player Info */}
              {gameState.blackPlayer && (
                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">B</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{gameState.blackPlayer.name}</h3>
                        <p className="text-sm text-gray-500">Playing Black</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-mono text-sm font-medium">
                        {formatTime(gameState.player2TimeConsumed)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chess Board */}
              <div className="flex justify-center mb-6">
                <ChessBoard
                  chess={chess}
                  setBoard={setBoard}
                  board={board}
                  socket={socket!!}
                  gameId={gameState.gameId}
                  isGameInProgress={gameState.status === 'IN_PROGRESS'}
                />
              </div>

              {/* White Player Info */}
              {gameState.whitePlayer && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-800 font-semibold">W</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{gameState.whitePlayer.name}</h3>
                        <p className="text-sm text-gray-500">Playing White</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-mono text-sm font-medium">
                        {formatTime(gameState.player1TimeConsumed)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Controls Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="space-y-6">

                {/* Game Status */}
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Game Status</h2>
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                    gameState.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                    gameState.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <Users className="h-4 w-4" />
                    <span>{gameState.status.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Game ID */}
                {gameState.gameId && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Game ID</label>
                    <code className="block text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                      {gameState.gameId}
                    </code>
                  </div>
                )}

                {/* Current Turn */}
                {gameState.status === 'IN_PROGRESS' && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Current Turn</p>
                    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold ${
                      gameState.currentTurn === 'w' ? 'bg-white border-2 border-gray-300 text-gray-800' :
                      'bg-gray-800 text-white'
                    }`}>
                      <span>{gameState.currentTurn === 'w' ? 'White' : 'Black'}</span>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="space-y-3">
                  {/* Start New Game */}
                  {gameState.status === 'WAITING' && (
                    <Button onClick={handleStartGame} >
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Button onClick={handleJoinGame} variant="secondary" >
                        Join Game
                      </Button>
                    </div>
                  )}

                  {/* Exit Game */}
                  {gameState.gameId && gameState.status === 'IN_PROGRESS' && (
                    <Button onClick={handleExitGame} variant="danger" >
                      Exit Game
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}