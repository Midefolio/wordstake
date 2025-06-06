
import React, { useState } from 'react';
import { 
  Play, Users, Trophy, Zap, Clock, Coins, Star, Target, Sparkles, 
  Menu, X, Settings, Wallet, History, TrendingUp, Award, User, ChevronRight,
  Eye, EyeOff, Crown, Medal, Gift, Bell, ShoppingCart,
  Calendar, Gamepad2, Sword, Book, Flame, Gem, Shield, Info
} from 'lucide-react';
import type { RootState } from '../../states';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const WordStakeDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showAssets, setShowAssets] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null);
  const currentUser = useSelector((state:RootState) => state.user.currentUser);
  const Navigate = useNavigate();

  const sidebarItems = [
    { id: 'overview', icon: <Target className="w-5 h-5" />, label: 'Overview' },
    { id: 'play', icon: <Play className="w-5 h-5" />, label: 'Play Game' },
    { id: 'history', icon: <History className="w-5 h-5" />, label: 'Game History' },
    { id: 'leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard' },
    { id: 'wallet', icon: <Wallet className="w-5 h-5" />, label: 'Wallet' },
    { id: 'achievements', icon: <Award className="w-5 h-5" />, label: 'Achievements' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const assetsInfo = {
    coins: {
      title: "Coins",
      description: "Your primary game currency used for:",
      features: [
        "Entering multiplayer battles",
        "Purchasing power-ups marketplace",
      ],
      howToEarn: "Earn coins by winning games, completing challenges, and daily rewards."
    },
    robot: {
      title: "Robot (Cheat)",
      description: "AI-powered assistant that helps you dominate the game:",
      features: [
        "Generates high-scoring word",
        // "Suggests optimal letter placements",
        // "Analyzes board for maximum points",
        // "Provides strategic gameplay hints"
      ],
      howToEarn: "Purchase with coins or earn through weekly challenges and achievements."
    },
    dictionary: {
      title: "Dictionary",
      description: "Your word validation tool for competitive play:",
      features: [
        "Instantly check if words are valid",
        // "Verify spellings during gameplay",
        // "Explore word definitions and meanings",
        // "Challenge disputed words in multiplayer"
      ],
      howToEarn: "Earn through completing word challenges or purchase in marketplace."
    }
  };

  const InfoModal = ({ assetKey, onClose }:any) => {
    const info = assetsInfo[assetKey];
    if (!info) return null;

    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-60 flex items-center justify-center p-4 transition-opacity duration-300">
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg border border-gray-700 transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">{info?.title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-gray-300 text-lg mb-4">{info?.description}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                Features & Benefits
              </h4>
              <ul className="space-y-2">
                {info.features.map((feature:any, index:any) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-2 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-green-400" />
                How to Earn More
              </h4>
              <p className="text-gray-300">{info.howToEarn}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AssetsModal = () => (
    <div className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${showAssets ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800 transform transition-all duration-300 ${showAssets ? 'scale-100' : 'scale-95'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Your Assets</h3>
          <button
            onClick={() => setShowAssets(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl relative">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <img src='https://img.icons8.com/?size=100&id=OFHwDWASQWmX&format=png&color=000000' className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Coins</p>
                <p className="text-xs lg:text-sm text-gray-400">Game currency</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm lg:text-xl font-bold text-yellow-400">{currentUser?.coins?.toLocaleString()}</span>
              <button
                onClick={() => setActiveInfo('coins')}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors group"
              >
                <Info className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl relative">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <img src='https://img.icons8.com/?size=100&id=pnUfrhjBRScY&format=png&color=000000' className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Robot</p>
                <p className="text-xs lg:text-sm text-gray-400">AI word assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm lg:text-xl font-bold text-blue-400">{currentUser?.expo?.toLocaleString()}</span>
              <button
                onClick={() => setActiveInfo('robot')}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors group"
              >
                <Info className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl relative">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <img src='https://img.icons8.com/?size=100&id=jHeVNP6Czq2b&format=png&color=000000' className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Dictionary</p>
                <p className="text-xs lg:text-sm text-gray-400">Word validator</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm lg:text-xl font-bold text-green-400">{currentUser?.dictionary}</span>
              <button
                onClick={() => setActiveInfo('dictionary')}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors group"
              >
                <Info className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
              </button>
            </div>
          </div>
        </div>
        
        <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <span>Visit Market</span>
        </button>
      </div>

      {/* Info Modal */}
      {activeInfo && (
        <InfoModal 
          assetKey={activeInfo} 
          onClose={() => setActiveInfo(null)} 
        />
      )}
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-4">
      {/* User Profile Section */}
      <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 backdrop-blur-sm rounded-2xl py-6 px-2 lg:py-6 lg:px-6  border border-gray-800/50">
        <div className="flex items-center space-x-2 lg:space-x-4 mb-6">
          <div className="w-10 h-10 lg:w-15 lg:h-15 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            {currentUser?.profilePicture ? (
              <img src={currentUser?.profilePicture?.secure_url} alt="Profile" className="w-full h-full rounded-full object-contain" />
            ) : (
              <User className="w-5 h-5 lg:w-8 lg:h-8 text-white" />
            )}
          </div>
          <div>
            <span className="text-md font-bold lg:text-2xl font-bold text-white">Welcome back, {currentUser?.username}!</span>
            <p className="text-purple-300 text-xs lg:text-xl mt-1">Ready to conquer some words?</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-xl">
              <img  src='https://img.icons8.com/?size=100&id=OFHwDWASQWmX&format=png&color=000000' className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-white text-xs lg:text-lg">
                {showBalance ? currentUser?.coins?.toLocaleString() : '••••••'}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAssets(true)}
            className="bg-white/10  text-xs lg:text-lg hover:bg-white/20 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
          >
            <Gem className="w-4 h-4" />
            <span>Assets</span>
          </button>
        </div>
      </div>

    {/* Play Game Now Section */}
      <div className='relative block lg:hidden'>
        <div className="relative z-10 text-center">
         <div className="relative inset-0 pointer-events-none">
          <Sparkles className="absolute top-6 left-1/4 w-4 h-4 text-yellow-400 animate-ping" />
          <Sparkles className="absolute top-12 right-1/3 w-3 h-3 text-purple-400 animate-pulse delay-150" />
          <Sparkles className="absolute bottom-8 left-1/3 w-5 h-5 text-pink-400 animate-bounce delay-300" />
          <Star className="absolute bottom-6 right-1/4 w-4 h-4 text-blue-400 animate-ping delay-500" />
        </div>
          <button
            onClick={() => {
              const gameSection = document.querySelector('#game-modes-section');
              if (gameSection) {
                gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="group relative text-center flex items-center justify-center bg-gradient-to-r w-full from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 px-8 py-4 lg:px-12 lg:py-5 rounded-2xl font-bold text-lg lg:text-2xl text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 active:scale-95"
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"></div>
            
            {/* Button Content */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform duration-300">
                <Play className="w-6 h-6 lg:w-8 lg:h-8 fill-current" />
              </div>
              <span className="font-bold tracking-wide">Play Game Now</span>
              <div className="p-2 bg-white/20 rounded-full group-hover:-rotate-12 transition-transform duration-300">
                <Zap className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
            </div>

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </button>

        </div>

        {/* Animated Wave Effect */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div> */}
      </div>





      

      {/* Records Table */}
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50">
        <h3 className="text-md lg:text-2xl font-bold text-white mb-6 flex items-center">
          <Trophy className=" h-5 w-5 lg:w-6 lg:h-6 mr-3 text-yellow-400" />
          Your Records
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 lg:px-4 text-gray-400 font-medium">Metric</th>
                <th className="text-right py-3 lg:px-4 text-gray-400 font-medium">Value</th>
                <th className="text-right py-3 lg:px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-4 lg:px-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs lg:text-lg">Total Played</p>
                      <p className="text-xs text-gray-400">All-time games</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs lg:text-xl font-bold text-white">{currentUser?.totalGames}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs lg:text-sm text-gray-400">Games</span>
                </td>
              </tr>
              
              <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-4 lg:px-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-600 rounded-lg">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs lg:text-lg">Weekly Rank</p>
                      <p className="text-xs text-gray-400">This week</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs lg:text-sm lg:text-xl font-bold text-yellow-400">#{currentUser?.weeklyRank}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs lg:text-sm text-green-400">↑ Rising</span>
                </td>
              </tr>
              
              <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-4 lg:px-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-whitetext-white text-xs lg:text-lg">Best Score</p>
                      <p className="text-xs text-gray-400">Personal record</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs lg:text-xl font-bold text-purple-400">{currentUser?.bestScore?.toLocaleString()}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs lg:text-sm text-gray-400">Points</span>
                </td>
              </tr>
              
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="py-4 lg:px-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <img src='image.png' className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-whitetext-white text-xs lg:text-lg">Total Earnings</p>
                      <p className="text-xs lg:text-sm text-gray-400">≈ $98.60</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs lg:text-xl font-bold text-green-400">${currentUser?.totalEarning}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm text-green-400 flex items-center justify-end">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Game Modes */}
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50" id='game-modes-section'>
        <h3 className="text-md lg:text-2xl font-bold text-white mb-6 flex items-center">
          <Gamepad2 className="w-6 h-6 mr-3 text-purple-400" />
          Choose Your Game
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Solo Play */}
          <button onClick={()=> {Navigate('/wordstake/play')}} className="group bg-gradient-to-br from-blue-600/20 to-blue-800/20 hover:from-blue-600/30 hover:to-blue-800/30 p-6 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 text-left">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h4 className="text-md lg:text-xl font-bold text-white mb-2">Solo Play</h4>
            <p className="text-gray-400 text-sm mb-4">Practice and perfect your word skills</p>
            <div className="flex items-center space-x-2 text-sm text-blue-300">
              <Coins className="w-4 h-4" />
              <span>Free to play</span>
            </div>
          </button>

          {/* Multiplayer */}
          <button className="group bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 p-6 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 text-left">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Sword className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h4 className="text-md lg:text-xl font-bold text-white mb-2">Multiplayer</h4>
            <p className="text-gray-400 text-sm mb-4">Battle other players in real-time</p>
            <div className="flex items-center space-x-2 text-sm text-purple-300">
              <Users className="w-4 h-4" />
              <span>2-4 players</span>
            </div>
          </button>

          {/* Weekly Challenge */}
          <button className="group bg-gradient-to-br from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 p-6 rounded-xl border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 text-left">
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h4 className="text-md lg:text-xl font-bold text-white mb-2">Weekly Challenge</h4>
            <p className="text-gray-400 text-sm mb-4">Special themed challenges</p>
            <div className="flex items-center space-x-2 text-sm text-yellow-300">
              <Calendar className="w-4 h-4" />
              <span>Resets Weekly</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const PlayTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Game Mode</h2>
        <p className="text-gray-400 mb-8">Select how you want to play and start earning!</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Solo Play */}
        <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/50 transition-all group">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Solo Play</h3>
            <p className="text-gray-400 text-sm">Practice and improve your skills</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rewards:</span>
              <span className="text-white">Coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time Limit:</span>
              <span className="text-white">2 minutes</span>
            </div>
          </div>
          <button onClick={()=> {Navigate('/wordstake/play')}} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition-colors">
            Start Solo Game
          </button>
        </div>

        {/* Multiplayer */}
        <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-purple-500/50 transition-all group">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Sword className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Multiplayer Battle</h3>
            <p className="text-gray-400 text-sm">Challenge other players</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Entry Fee:</span>
              <span className="text-white">determined by host</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Max Players:</span>
              <span className="text-white">2-4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Prize Pool:</span>
              <span className="text-green-400">Winner takes all</span>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-semibold transition-colors">
            Find Match
          </button>
        </div>

        {/* Weekly Challenge */}
        <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 hover:border-yellow-500/50 transition-all group">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Weekly Challenge</h3>
            <p className="text-gray-400 text-sm">Special themed challenges</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">This Week:</span>
              <span className="text-white">Animal Words</span>
            </div>
            {/* <div className="flex justify-between text-sm">
              <span className="text-gray-400">Participants:</span>
              <span className="text-white">1,247</span>
            </div> */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Top Prize:</span>
              <span className="text-green-400">100 USDC</span>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-3 rounded-xl font-semibold transition-colors">
            Join Challenge
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'play':
        return <PlayTab />;
      default:
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400">This feature is under development</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                WordStake
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Header */}
          <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50 p-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-md lg:text-2xl font-bold">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                  {/* <p className="text-gray-400 text-sm">
                    {activeTab === 'overview' && 'Your gaming dashboard and statistics'}
                    {activeTab === 'play' && 'Choose your game mode and start playing'}
                  </p> */}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-white relative transition-colors rounded-lg hover:bg-gray-800/50">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="mt-2 p-3 lg:p-4 lg:p-6">
            {renderActiveTab()}
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Assets Modal */}
        <AssetsModal />
      </div>
    </>
  );
};

export default WordStakeDashboard;