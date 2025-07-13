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

  const [from, setFrom] = useState<null | Square>(null)
  const pieceUnicodeMap: Record<PieceSymbol, { w: string; b: string }> = {
    p: { w: "♙", b: "♟︎" },
    r: { w: "♖", b: "♜" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };

  // const handleSquareClick = (square: Square) => {
  //   if (!from) {
  //     setFrom(square);
  //     return;
  //   }

  //   const move = { from, to: square };
  //   const result = chess.move(move);

  //   if (result) {
  //     socket.send(JSON.stringify({
  //       type: MOVE,
  //       payload: { move }
  //     }));
  //     setBoard(chess.board());
  //     console.log("Valid move:", move);
  //   } else {
  //     console.warn("Invalid move:", move);
  //   }

  //   setFrom(null); // always reset selection after second click
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
    socket.send(JSON.stringify({
      type: MOVE,
      payload: { move }
    }));
    setBoard(chess.board());
    console.log("✅ Valid move:", move);
  } else {
    console.warn("❌ Invalid move:", move);
  }

  setFrom(null); // always reset
};




  return (
    <div className="text-black">
        {board.map((row, i)=>{
            return <div key={i} className="flex">
                {row.map((square, j)=>{
                  const squareRepresentation =(String.fromCharCode('a'.charCodeAt(0) + j) + (8 - i)) as Square;

                    return <div
                      key={j} className={`w-16 h-16 ${(i+j)%2 ==0 ? 'bg-green-500' : 'bg-green-100'}`}
                      onClick={()=>handleSquareClick(squareRepresentation)}
                    >
                        <div className="w-full justify-center flex h-full">
                            <div className="h-full justify-center flex flex-col text-3xl">{square ? pieceUnicodeMap[square.type][square.color] : ''}</div>
                        </div>
                    </div>
                })}

            </div>
        })}
    </div>
  )
}