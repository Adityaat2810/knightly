import type { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../pages/Game";

export const ChessBoard = ({
  chess,
  board,
  socket,
  gameId,
  isGameInProgress
}: {
  chess: Chess;
  setBoard: React.Dispatch<React.SetStateAction<({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]>>;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  gameId: string | null;
  isGameInProgress: boolean;
}) => {

  const moveSound = new Audio('/move.wav');
  const captureSound = new Audio('/capture.wav');
  const [from, setFrom] = useState<null | Square>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);

  const handleSquareClick = (square: Square) => {
    if (!gameId || !isGameInProgress) {
      console.log("Game not in progress");
      return;
    }

    if (!from) {
      // Select piece
      const piece = chess.get(square);
      if (piece && piece.color === chess.turn()) {
        setFrom(square);
        // Get possible moves for this piece
        const moves = chess.moves({ square, verbose: true });
        setPossibleMoves(moves.map(move => move.to));
      }
      return;
    }

    // Clear possible moves
    setPossibleMoves([]);

    // If clicking the same square, deselect
    if (from === square) {
      setFrom(null);
      return;
    }

    const move = { from, to: square };

    // Check if this is a valid move before sending to server
    const possibleMove = chess.moves({ square: from, verbose: true })
      .find(m => m.to === square);

    if (!possibleMove) {
      console.warn("Invalid move:", move);
      setFrom(null);
      return;
    }

    // Create the move object with additional data
    const moveData = {
      from: possibleMove.from,
      to: possibleMove.to,
      san: possibleMove.san,
      before: chess.fen(),
      after: '', // Will be set by backend after move
      promotion: possibleMove.promotion || 'q' // Default to queen promotion
    };

    // Send move to server
    socket.send(
      JSON.stringify({
        type: MOVE,
        payload: {
          gameId,
          move: moveData,
        },
      })
    );

    // Play sound effect
    try {
      if (possibleMove.captured) {
        captureSound.play().catch(e => console.log('Audio play failed:', e));
      } else {
        moveSound.play().catch(e => console.log('Audio play failed:', e));
      }
    } catch (e) {
      console.log('Audio error:', e);
    }

    console.log("Move sent:", moveData);
    setFrom(null);
  };

  const isHighlighted = (square: Square) => {
    return from === square;
  };

  const isPossibleMove = (square: Square) => {
    return possibleMoves.includes(square);
  };

  const isLastMove = (square: Square) => {
    const history = chess.history({ verbose: true });
    if (history.length === 0) return false;
    const lastMove = history[history.length - 1];
    return lastMove.from === square || lastMove.to === square;
  };

  return (
    <div className="relative">
      {/* Chess board */}
      <div className="border-4 border-amber-700 rounded-lg overflow-hidden">
        {board.map((row, i) => {
          return (
            <div key={i} className="flex">
              {row.map((square, j) => {
                const squareRepresentation = (String.fromCharCode('a'.charCodeAt(0) + j) + (8 - i)) as Square;
                const isLight = (i + j) % 2 === 0;
                const highlighted = isHighlighted(squareRepresentation);
                const possibleMove = isPossibleMove(squareRepresentation);
                const lastMove = isLastMove(squareRepresentation);

                return (
                  <div
                    key={j}
                    className={`w-16 h-16 relative cursor-pointer transition-all duration-200 ${
                      isLight ? 'bg-amber-100' : 'bg-amber-800'
                    } ${
                      highlighted ? 'ring-4 ring-blue-400' : ''
                    } ${
                      lastMove ? 'ring-2 ring-yellow-400' : ''
                    } ${
                      possibleMove ? 'ring-2 ring-green-400' : ''
                    } ${
                      isGameInProgress ? 'hover:bg-opacity-80' : 'cursor-not-allowed'
                    }`}
                    onClick={() => handleSquareClick(squareRepresentation)}
                  >
                    {/* Coordinate labels */}
                    {j === 0 && (
                      <div className="absolute top-1 left-1 text-xs font-bold text-slate-700">
                        {8 - i}
                      </div>
                    )}
                    {i === 7 && (
                      <div className="absolute bottom-1 right-1 text-xs font-bold text-slate-700">
                        {String.fromCharCode('a'.charCodeAt(0) + j)}
                      </div>
                    )}

                    {/* Piece */}
                    <div className="w-full h-full flex justify-center items-center">
                      {square && (
                        <img
                          src={`/${square.color}${square.type}.png`}
                          alt={`${square.color}${square.type}`}
                          className="w-12 h-12 object-contain pointer-events-none"
                        />
                      )}
                    </div>

                    {/* Possible move indicator */}
                    {possibleMove && !square && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full opacity-70"></div>
                      </div>
                    )}

                    {/* Capture indicator */}
                    {possibleMove && square && (
                      <div className="absolute inset-0 border-4 border-red-500 rounded-full opacity-70"></div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game status indicator */}
      {!isGameInProgress && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-white text-xl font-bold">
            {gameId ? 'Game Not Active' : 'No Game Started'}
          </div>
        </div>
      )}
    </div>
  );
};