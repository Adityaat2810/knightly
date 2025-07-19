import  { useState } from 'react';
import { Copy, Users, Play, Clock, Crown, Shield } from 'lucide-react';
import type { User } from '@repo/store/userAtom';

const BACKEND_URL = 'http://localhost:3000';

export default function GameLobby({ user, onGameCreated }:{
  user:User,
  onGameCreated:(newGameId:string)=>void
}) {
  const [gameId, setGameId] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    timeControl: '10+0',
    gameType: 'rated',
    color: 'random'
  });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const timeControls = [
    { value: '1+0', label: '1 min', type: 'Bullet' },
    { value: '3+0', label: '3 min', type: 'Blitz' },
    { value: '5+0', label: '5 min', type: 'Blitz' },
    { value: '10+0', label: '10 min', type: 'Rapid' },
    { value: '15+10', label: '15+10', type: 'Rapid' },
    { value: '30+0', label: '30 min', type: 'Classical' }
  ];

  const generateGameId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createGame = async () => {
    if (!user) {
      setError('Please log in to create a game');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const newGameId = generateGameId();

      const response = await fetch(`${BACKEND_URL}/game/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          gameId: newGameId,
          settings: gameSettings
        })
      });

      if (response.ok) {
        setGameId(newGameId);
        onGameCreated?.(newGameId);
      } else {
        setError('Failed to create game. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Create game error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async () => {
    if (!joinGameId.trim()) {
      setError('Please enter a game ID');
      return;
    }

    if (!user) {
      setError('Please log in to join a game');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/game/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          gameId: joinGameId.trim().toUpperCase()
        })
      });

      if (response.ok) {
        window.location.href = `/game/${joinGameId.trim().toUpperCase()}`;
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to join game');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Join game error:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const copyGameId = async () => {
    if (!gameId) return;

    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareGame = () => {
    const gameUrl = `${window.location.origin}/game/${gameId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join my chess game!',
        text: `Join my chess game with ID: ${gameId}`,
        url: gameUrl
      });
    } else {
      copyGameId();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Chess Arena</h1>
          </div>
          <p className="text-slate-300 text-lg">Create a game or join an existing one</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Game Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Play className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-semibold text-white">Create Game</h2>
            </div>

            {!gameId ? (
              <div className="space-y-6">
                {/* Time Control */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time Control
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeControls.map((control) => (
                      <button
                        key={control.value}
                        onClick={() => setGameSettings({...gameSettings, timeControl: control.value})}
                        className={`p-3 rounded-lg border transition-all ${
                          gameSettings.timeControl === control.value
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="font-medium">{control.label}</div>
                        <div className="text-xs opacity-75">{control.type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Game Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['rated', 'casual'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setGameSettings({...gameSettings, gameType: type})}
                        className={`p-3 rounded-lg border transition-all capitalize ${
                          gameSettings.gameType === type
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Choice */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Color Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'white', label: 'White', bg: 'bg-white text-black' },
                      { value: 'black', label: 'Black', bg: 'bg-gray-800 text-white' },
                      { value: 'random', label: 'Random', bg: 'bg-gradient-to-r from-white to-gray-800 text-black' }
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setGameSettings({...gameSettings, color: color.value})}
                        className={`p-3 rounded-lg border transition-all ${
                          gameSettings.color === color.value
                            ? 'ring-2 ring-blue-500 border-blue-500'
                            : 'border-slate-600 hover:border-slate-500'
                        } ${color.bg}`}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createGame}
                  disabled={isCreating}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Game...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Create Game
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">Game Created!</h3>
                  <p className="text-slate-300 text-sm mb-3">Share this Game ID with your opponent:</p>
                  <div className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-lg">
                    <code className="text-lg font-mono text-green-400 flex-1">{gameId}</code>
                    <button
                      onClick={copyGameId}
                      className="p-2 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied && <p className="text-green-400 text-sm mt-2">Copied to clipboard!</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={shareGame}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Share Game
                  </button>
                  <button
                    onClick={() => window.location.href = `/game/${gameId}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Enter Game
                  </button>
                </div>

                <button
                  onClick={() => {
                    setGameId('');
                    setError('');
                  }}
                  className="w-full text-slate-400 hover:text-white transition-colors"
                >
                  Create Another Game
                </button>
              </div>
            )}
          </div>

          {/* Join Game Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">Join Game</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Game ID
                </label>
                <input
                  type="text"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value.toUpperCase())}
                  placeholder="Enter game ID..."
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={8}
                />
              </div>

              <button
                onClick={joinGame}
                disabled={isJoining || !joinGameId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining Game...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Join Game
                  </>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-700">
              <h3 className="text-lg font-medium text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm">
                  <Clock className="w-4 h-4 mx-auto mb-1" />
                  Quick Match
                </button>
                <button className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm">
                  <Crown className="w-4 h-4 mx-auto mb-1" />
                  Tournaments
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="text-center text-slate-400">
            <p>Welcome back, <span className="text-white font-medium">{user.name}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}