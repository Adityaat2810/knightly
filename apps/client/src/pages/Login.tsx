import React, { useRef } from 'react';
import { Github, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userAtom } from '@repo/store/userAtom';

const BACKEND_URL =
  import.meta.env.VITE_APP_BACKEND_URL;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [_, setUser] = useRecoilState(userAtom);
  const guestName = useRef<HTMLInputElement>(null);

  const handleGitHubLogin = () => {
    window.location.href = import.meta.env.VITE_APP_BACKEND_URL+"/auth/github";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 md:p-10 text-center">

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          Welcome to Knightly
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          Sign in to play chess with friends or try as a guest.
        </p>

        <button
          onClick={handleGitHubLogin}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow hover:opacity-90 transition-all duration-200 w-full mb-5"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-400 text-xs">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div className="space-y-3 text-left">
          <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
            Guest Name
          </label>
          <input
            ref={guestName}
            id="guestName"
            type="text"
            placeholder="Enter your name (optional)"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-150"
          />

          <button
            onClick={loginAsGuest}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 w-full"
          >
            <User className="w-5 h-5" />
            Continue as Guest
          </button>
        </div>

        <div className="mt-8 text-xs text-gray-400 text-center">
          By continuing, you agree to our <a href="#" className="underline hover:text-gray-600">Terms</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default Login;
