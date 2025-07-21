import React, { useRef } from 'react';
import { Github, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userAtom } from '@repo/store/userAtom';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

const Login: React.FC = () => {

  const navigate = useNavigate();
  const [_, setUser] = useRecoilState(userAtom);
  const guestName = useRef<HTMLInputElement>(null);

  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  const loginAsGuest = async () => {
   const response = await fetch(`${BACKEND_URL}/auth/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: (guestName.current && guestName.current.value) || '',
      }),
    });
    const user = await response.json();
    setUser(user);
    navigate('/game/random');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20 p-10 rounded-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to CineDraw</h1>
        <p className="text-gray-300 mb-8 text-sm">
          Sign in to play the game and start guessing movies with friends.
        </p>

        {/* GitHub Login Button */}
        <button
          onClick={handleGitHubLogin}
          className="flex items-center justify-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-gray-200 transition-all duration-200 w-full mb-6"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Guest Login Section */}
        <div className="space-y-4">
          <div className="text-left">
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-300 mb-2">
              Play as Guest
            </label>
            <input
              ref={guestName}
              id="guestName"
              type="text"
              placeholder="Enter your name (optional)"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
            />
          </div>

          <button
            onClick={loginAsGuest}
            className="flex items-center justify-center gap-3 bg-gray-700/80 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 w-full border border-gray-600/50"
          >
            <User className="w-5 h-5" />
            Continue as Guest
          </button>
        </div>

        <div className="mt-10 text-sm text-gray-400">
          By continuing, you agree to our <a href="#" className="underline hover:text-white">Terms</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default Login;