import { useNavigate } from "react-router-dom"



import React, { useState, useEffect } from 'react';
import { Users, Link2, Zap, Shield, Globe } from 'lucide-react';

interface MousePosition {
  x: number;
  y: number;
}

interface FloatingPieceProps {
  src: string;
  alt: string;
  delay: number;
  duration: number;
  top: string;
  left: string;
}

const Landing: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const naviagte = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const FloatingPiece: React.FC<FloatingPieceProps> = ({ src, alt, delay, duration, top, left }) => (
    <div
      className="absolute opacity-20
      transition-transform duration-1000 ease-out animate-pulse"
      style={{
        top,
        left,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
      }}
    >
      <img src={src} alt={alt} className="w-16 h-16 object-contain" />
    </div>
  );

  const handlePlayOnline = (): void => {
    naviagte('/game')
  };

  const handlePlayWithFriend = (): void => {
    console.log('Play with Friend clicked');
  };

  return (
    <div className="
      min-h-screen bg-gradient-to-br from-slate-100 via-gray-50
      to-slate-100 text-gray-900 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <FloatingPiece
          src="/bq.png"
          alt="Black Queen" delay={0} duration={8}
          top="10%" left="10%"
        />
        <FloatingPiece
          src="/wq.png"
          alt="White Queen" delay={1} duration={9}
          top="20%" left="80%"
        />
        <FloatingPiece
          src="/bb.png"
          alt="Black Bishop" delay={2} duration={7}
          top="60%" left="15%"
        />
        <FloatingPiece
          src="/wb.png"
          alt="White Bishop" delay={3} duration={8}
          top="70%" left="85%"
        />
        <FloatingPiece
          src="/bn.png"
          alt="Black Knight" delay={4} duration={6}
          top="40%" left="5%"
        />
        <FloatingPiece
          src="/wn.png"
          alt="White Knight" delay={5} duration={7}
          top="30%" left="90%"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center
        justify-center min-h-screen px-6 py-12"
      >
        <div className="text-center mb-16">

          <div className="flex items-center justify-center mb-6">
            <img
              src="/wq.png"
              alt="Chess Queen"
              className="w-12 h-12 mr-4"
            />
            <h1 className="text-5xl md:text-6xl
              font-semibold text-gray-800 tracking-tight"
            >
              Knightly
            </h1>
          </div>
          <p className="text-xl text-gray-600
            max-w-2xl mx-auto leading-relaxed"
          >
            Experience the ultimate chess battleground. Play with friends or challenge players worldwide in real-time.
          </p>
        </div>

        <div className="mb-16 relative">
          <div className="absolute inset-0
            bg-gradient-to-r from-gray-200/50 to-slate-200/50
            rounded-xl blur-lg">

          </div>
          <img
            src="/crystalknight.png"
            alt="Chess Board"
            className="relative w-120 h-80 object-cover rounded-xl shadow-lg"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-20">
          <button
            onClick={handlePlayOnline}
            className="group px-10 py-4 bg-gray-900 text-white
              rounded-xl font-medium text-lg hover:bg-gray-800
              transition-all duration-300 transform hover:scale-105
              shadow-lg hover:shadow-xl flex items-center justify-center min-w-52"
          >
            <Globe className="w-6 h-6 mr-3 group-hover:animate-pulse" />
            Play Online
          </button>

          <button
            onClick={handlePlayWithFriend}
            className="group px-10 py-4 bg-white
            text-gray-900 rounded-xl font-medium
            text-lg border-2 border-gray-300 hover:border-gray-400
            transition-all duration-300 transform hover:scale-105
            shadow-lg hover:shadow-xl flex items-center
            justify-center min-w-52"
          >
            <Link2 className="w-6 h-6 mr-3 group-hover:animate-pulse" />
            Play with Friend
          </button>
        </div>

        <div className="grid md:grid-cols-3
          gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center p-6 bg-white/50
            backdrop-blur-sm rounded-xl border border-gray-200
           hover:border-gray-300 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full
              flex items-center justify-center mx-auto mb-4"
            >
              <Zap className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Play
            </h3>
            <p className="text-gray-600">
              Lightning-fast WebSocket connections ensure smooth, lag-free gameplay
            </p>
          </div>

          <div className="text-center p-6 bg-white/50
            backdrop-blur-sm rounded-xl border border-gray-200
          hover:border-gray-300 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gray-100
              rounded-full flex items-center justify-center
              mx-auto mb-4"
            >
              <Users className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold
             text-gray-900 mb-2"
            >Global Matches</h3>
            <p className="text-gray-600">
              Connect with chess enthusiasts worldwide and test your skills
            </p>
          </div>

          <div className="text-center p-6 bg-white/50
            backdrop-blur-sm rounded-xl border
            border-gray-200 hover:border-gray-300
            transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gray-100
              rounded-full flex items-center justify-center
              mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Private Games
            </h3>
            <p className="text-gray-600">
              Create invite links and challenge your friends to private matches
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-500">
            Ready to make your move? Join thousands of players online.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;