import type { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../pages/Game";

export const ChessBoard = ({chess, setBoard, board, socket}:{
  chess:Chess;
  setBoard:React.Dispatch<React.SetStateAction<({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]>>;

  board:({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];

  socket: WebSocket;


}) => {
  const moveSound = new Audio('/move.wav');
  const captureSound = new Audio('/capture.wav');
  const [from, setFrom] = useState<null | Square>(null)

  // const handleSquareClick = (square: Square) => {
  //   if (!from) {
  //     setFrom(square);
  //     return;
  //   }

  //   const move = { from, to: square };
  //     let result = null;

  //     try {
  //       result = chess.move(move);
  //     } catch (error) {
  //       console.error("💥 Error while executing move:", error);
  //     }

  //     if (result) {
  //       socket.send(JSON.stringify({
  //         type: MOVE,
  //         payload: { move }
  //       }));
  //       setBoard(chess.board());
  //       console.log("Valid move:", move);
  //     } else {
  //       console.warn("Invalid move:", move);
  //     }

  //     setFrom(null);
  // };
  const handleSquareClick = (square: Square) => {
  if (!from) {
    setFrom(square);
    return;
  }

  const move = { from, to: square };
  let result = null;

  try {
    result = chess.move(move);
  } catch (error) {
    console.error("💥 Error while executing move:", error);
  }

  if (result) {
    // 🔊 Play sound based on move type
    if (result.captured) {
      captureSound.play();
    } else {
      moveSound.play();
    }

    socket.send(
      JSON.stringify({
        type: MOVE,
        payload: { move },
      })
    );

    setBoard(chess.board());
    console.log("Valid move:", move);
  } else {
    console.warn("Invalid move:", move);
  }

  setFrom(null);
};

  return (
    <div className="text-black">
        {board.map((row, i)=>{
            return <div key={i} className="flex">
                {row.map((square, j)=>{
                  const squareRepresentation =(String.fromCharCode('a'.charCodeAt(0) + j) + (8 - i)) as Square;

                    return (
                      <div
                        key={j}
                        className={`w-16 h-16 ${(i + j) % 2 === 0 ? 'bg-green-500' : 'bg-green-100'}`}
                        onClick={() => handleSquareClick(squareRepresentation)}
                      >
                        <div className="w-full h-full flex justify-center items-center">
                          {square && (
                            <img
                              src={`/${square.color}${square.type}.png`} // from public/
                              alt={`${square.color}${square.type}`}
                              className="w-12 h-12 object-contain"
                            />
                          )}
                        </div>
                      </div>
                    );

                })}

            </div>
        })}
    </div>
  )
}