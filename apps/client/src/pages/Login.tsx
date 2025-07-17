import React from 'react';
import { Github } from 'lucide-react';

const Login: React.FC = () => {
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:3000/auth/github";

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20 p-10 rounded-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to CineDraw</h1>
        <p className="text-gray-300 mb-8 text-sm">
          Sign in to play the game and start guessing movies with friends.
        </p>

        <button
          onClick={handleGitHubLogin}
          className="flex items-center justify-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-gray-200 transition-all duration-200 w-full"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>

        <div className="mt-10 text-sm text-gray-400">
          By continuing, you agree to our <a href="#" className="underline hover:text-white">Terms</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
};

export default Login;
