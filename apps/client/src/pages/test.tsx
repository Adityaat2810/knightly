import { useState } from "react";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";

export default function GameRandom() {
  const [roomId, setRoomId] = useState("");
  const [createdRoom, setCreatedRoom] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateGame = () => {
    const newRoomId = '22uey93ye94ye874'; // create a short room ID
    setCreatedRoom(newRoomId);
  };

  const handleJoinGame = () => {
    if (roomId.trim()) {
      navigate(`/game/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">♟️ Welcome to Chess Lobby</h2>

        {/* Create Game Section */}
        <div className="mb-8">
          <Button  onClick={handleCreateGame}>
            Create Game
          </Button>
          {createdRoom && (
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Share this Room ID: <span className="font-mono font-bold">{createdRoom}</span>
              <div className="mt-1">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/game/${createdRoom}`);
                  }}
                >
                  Copy Invite Link
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Join Game Section */}
        <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 mb-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          <Button onClick={handleJoinGame}>
            Join Game
          </Button>
        </div>
      </div>
    </div>
  );
}
