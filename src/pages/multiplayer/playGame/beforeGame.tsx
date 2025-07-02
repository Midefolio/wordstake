import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, ArrowLeft, User, Clock, Target, Trophy, Sparkles, Star, Zap, X, AlertTriangle } from "lucide-react";
import { makeRequest } from '../../../hook/useApi';
import { isSending, notifySuccess } from '../../../utils/useutils';
import useUserAuthContext from '../../../hook/userUserAuthContext';
import { playGameApi, startGameApi, updateGamerApi } from '../../../api';
import { useNavigate, useParams } from 'react-router-dom';

const BeforeGame = ({ currentUser, clearCurrentGameState, startGame}:any ) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { token } = useUserAuthContext();
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<any>([]);
  const [showPendingGameModal, setShowPendingGameModal] = useState(false);
  const Navigate  = useNavigate(); 
  const { gameCode } = useParams();
  const [error, setError] = useState<any>();
  const navigate = useNavigate();

  const initializeGame = async () => {
    isSending(true, "Initializing game...");
     const { res, error } = await makeRequest("POST", playGameApi, {gameCode, pubKey:currentUser?.pubkey}, () => {isSending(false, " ")}, token,  null,  "urlencoded");
      if (error) {
        setError(error);
        return;
      }

      if (res) {
        // Handle different game statuses
        switch (res.message) {
          case "Player already played game":
            navigate(`/multiplayer/results/${gameCode}`);
            return;
            
          case "Game ended":
            setError("Game has ended");
            return;
            
          case "Game not started":
            navigate(`/multiplayer/join/${gameCode}`);
            notifySuccess("Game not started yet. Please wait for the host to start the game.");
            return;
            
          case "Game ready to play":
             await startGame(res?.data.duration, res?.data?.letters)
            break;
            
          default:
            console.error('Unknown game status:', res.status);
            setError({ message: "Unknown game status" });
            break;
        }
    
    }
  
  };

  return (
    <>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900/20 via-transparent to-purple-900/20" />
        
        {/* Floating Particles */}
        {particles.map((particle:any) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}

        {/* Dynamic gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.button
              onClick={() => console.log("goToDashboard")}
              className="flex items-center space-x-3 text-white/80 hover:text-white transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div onClick={()=> {Navigate('/wordstake')}} className="p-3 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </motion.button>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm border border-white/20">
                <div className="w-8 h-8 lg:h-10 w-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center relative">
                  {currentUser?.profilePicture?.secure_url ? (
                    <img className="w-5 h-5 rounded-full object-cover" src={currentUser.profilePicture.secure_url} alt="Profile" />
                  ) : (
                    <span className="text-white font-bold text-sm">{currentUser?.username?.[0] || 'P'}</span>
                  )}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-semibold text-white text-sm uppercase">{currentUser?.username || 'Player'}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative min-h-screen pt-30 lg:pt-50 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12 relative">
            <div className="inline-block relative">
              <span className="text-4xl sm:text-5xl lg:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 relative">
                Multiplayer
                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4">
                  <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 blur-2xl opacity-20 -z-10" />
            </div>
            <div className="text-sm mt-2 md:mt-8 sm:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed px-4">
             GameId: <span className='uppercase'>{gameCode}</span>
            </div>
          </div>

          {/* Epic Start Button */}
          <div className="text-center relative mb-10">
            <div className="">
              <div className="" />
              <button
                onClick={initializeGame}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-12 py-6 rounded-2xl text-xl font-bold text-white hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-center">
                  <span className=''>Start Game</span>
                </div>
                
                {/* Button particles */}
                {isHovered && (
                  <>
                    <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-300 animate-pulse" />
                    <Star className="absolute bottom-2 left-2 w-3 h-3 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Game Instructions - Enhanced Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-30">
            {[
              {
                icon: Clock,
                title: "Lightning Round",
                desc: "2 minutes of pure word-crafting intensity",
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-500/20 to-cyan-500/20"
              },
              {
                icon: Target,
                title: "Word Mastery",
                desc: "Transform letters into linguistic gold",
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-500/20 to-emerald-500/20"
              },
              {
                icon: Trophy,
                title: "Score Dynasty",
                desc: "Longer words = legendary rewards",
                color: "from-yellow-500 to-orange-500",
                bgColor: "from-yellow-500/20 to-orange-500/20"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-sm lg:text-lg mb-2">{item.title}</h4>
                  <p className="text-white/70 text-xs lg:text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </>
  );
};

export default BeforeGame;