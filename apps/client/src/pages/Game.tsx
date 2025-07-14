import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";

// Message types
export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const GAME_OVER = 'game_over';

export default function Game() {
  const socket = useSocket();
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"white" | "black" | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message received:", message);

      switch (message.type) {
        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          setGameOver(false);
          setWinner(null);
          console.log("GAME INITIALIZED!");
          break;

        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          console.log("Move made:", move);
          break;

        case GAME_OVER:
          console.log("GAME OVER:", message.payload);
          setGameOver(true);
          setWinner(message.payload.winner);
          break;

        default:
          console.warn("Unknown message type:", message.type);
      }
    };
  }, [socket]);

  if (!socket) return <div className="text-amber-200">Connecting...</div>;

  return (
    <>
      {/* Game Over banner */}
      {gameOver && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-700 text-white px-6 py-3 rounded-xl shadow-lg z-10 text-xl font-semibold">
          Game Over! Winner: {winner}
        </div>
      )}

      <div className="justify-center flex">
        <div className="pt-8 max-w-screen-lg w-full">
          <div className="grid grid-cols-6 gap-4 w-full">
            <div className="col-span-4 w-full flex justify-center">
              <ChessBoard
                chess={chess}
                setBoard={setBoard}
                board={board}
                socket={socket}
              />
            </div>

            <div className="col-span-2 bg-slate-800 w-full flex justify-center">
              <div className="pt-8">
                {!started && (
                  <Button
                    onClick={() => {
                      socket.send(
                        JSON.stringify({
                          type: INIT_GAME
                        })
                      );
                    }}
                  >
                    Play
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
