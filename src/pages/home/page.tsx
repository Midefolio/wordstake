import React, { useState, useEffect } from 'react';
import { Play, Users, Trophy, Zap, Clock, Coins, Star, Target, Brain, Sparkles, Menu, X } from 'lucide-react';
import ConnectWallet from '../../components/wallet_connect/connection';

interface MousePosition {
  x: number;
  y: number;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface LetterPoints {
  [key: string]: number;
}

const WordStakeLanding: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features: Feature[] = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Smart Scoring",
      description: "Each letter has unique points based on difficulty and rarity"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Time Challenge",
      description: "Race against time to form as many words as possible"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multiplayer Battles",
      description: "Compete with friends and players worldwide"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Crypto Stakes",
      description: "Bet on Solana blockchain and win real rewards"
    }
  ];

  const letterPoints: LetterPoints = { 
    'a': 1, 'e': 1, 'i': 1, 'o': 1, 'u': 1, 'n': 1, 'r': 1, 't': 1, 'l': 1, 's': 1, 
    'c': 2, 'd': 2, 'g': 2, 'h': 2, 'm': 2, 'p': 2, 
    'b': 3, 'f': 3, 'w': 3, 'y': 3, 
    'k': 4, 'v': 4, 
    'j': 5, 'x': 5, 
    'q': 8, 'z': 8 
  };
  
  const sampleLetters: string[] = ['w', 'o', 'r', 'd', 's', 't', 'a', 'k'];

  // Custom SVG Components
  const GeometricPattern: React.FC = () => (
    <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100">
      <defs>
        <pattern id="geometric" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <polygon points="10,1 4,7 4,13 10,19 16,13 16,7" fill="currentColor" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geometric)" />
    </svg>
  );

  const FloatingElements: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
            animationDelay: `${i * 0.5}s`,
            transform: `translateY(${Math.sin(scrollY * 0.01 + i) * 20}px)`
          }}
        />
      ))}
    </div>
  );

  const WordIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="16" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="12" y="20" width="8" height="8" rx="2" fill="currentColor" opacity="0.8"/>
      <rect x="24" y="20" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
      <rect x="36" y="20" width="8" height="8" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="48" y="20" width="4" height="8" rx="2" fill="currentColor" opacity="0.4"/>
      <rect x="12" y="32" width="12" height="8" rx="2" fill="currentColor" opacity="0.7"/>
      <rect x="28" y="32" width="6" height="8" rx="2" fill="currentColor" opacity="0.5"/>
      <rect x="38" y="32" width="14" height="8" rx="2" fill="currentColor" opacity="0.8"/>
    </svg>
  );

  const BlockchainIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
      <rect x="26" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.4"/>
      <rect x="44" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.6"/>
      <rect x="8" y="26" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.3"/>
      <rect x="26" y="26" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.7"/>
      <rect x="44" y="26" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.5"/>
      <rect x="8" y="44" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.6"/>
      <rect x="26" y="44" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.2"/>
      <rect x="44" y="44" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" opacity="0.8"/>
      <line x1="20" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="2"/>
      <line x1="38" y1="14" x2="44" y2="14" stroke="currentColor" strokeWidth="2"/>
      <line x1="14" y1="20" x2="14" y2="26" stroke="currentColor" strokeWidth="2"/>
      <line x1="32" y1="20" x2="32" y2="26" stroke="currentColor" strokeWidth="2"/>
      <line x1="50" y1="20" x2="50" y2="26" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <path d="M16 16v16c0 8.837 7.163 16 16 16s16-7.163 16-16V16H16z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <rect x="28" y="48" width="8" height="8" fill="currentColor" opacity="0.6"/>
      <rect x="20" y="56" width="24" height="4" rx="2" fill="currentColor"/>
      <path d="M8 20h8v8c0 2.209-1.791 4-4 4s-4-1.791-4-4v-8z" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="2"/>
      <path d="M48 20h8v8c0 2.209-1.791 4-4 4s-4-1.791-4-4v-8z" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="32" cy="24" r="3" fill="currentColor" opacity="0.8"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Background Elements */}
      <GeometricPattern />
      <FloatingElements />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute w-72 h-72 bg-purple-600 rounded-full blur-3xl transition-all duration-1000"
          style={{
            left: `${10 + mousePosition.x * 0.01}%`,
            top: `${10 + mousePosition.y * 0.01}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-60 h-60 bg-blue-600 rounded-full blur-3xl transition-all duration-1000"
          style={{
            right: `${5 + mousePosition.x * 0.008}%`,
            bottom: `${5 + mousePosition.y * 0.008}%`,
            transform: 'translate(50%, 50%)'
          }}
        />
        <div 
          className="absolute w-48 h-48 bg-cyan-600 rounded-full blur-3xl transition-all duration-1000"
          style={{
            left: `${60 - mousePosition.x * 0.005}%`,
            top: `${70 - mousePosition.y * 0.005}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-xl flex items-center justify-center">
            <WordIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            WordStake
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex space-x-8 text-sm xl:text-base">
          <a href="#features" className="hover:text-purple-400 transition-colors duration-300">Features</a>
          <a href="#leaderboard" className="hover:text-purple-400 transition-colors duration-300">Leaderboard</a>
          <a href="#rewards" className="hover:text-purple-400 transition-colors duration-300">Rewards</a>
         
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        {/* Connect Wallet Button */}
         <ConnectWallet/>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-800 z-40 border-t border-gray-700">
          <div className="flex flex-col space-y-4 p-6">
            <a href="#features" className="hover:text-purple-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#leaderboard" className="hover:text-purple-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Leaderboard</a>
            <a href="#rewards" className="hover:text-purple-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Rewards</a>
            <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full transition-all text-left">
              Play WordStake <Sparkles/>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 text-center py-12 sm:py-16 lg:py-20 xl:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-9xl font-extrabold mb-4 sm:mb-6 lg:mb-8 leading-tight relative">
            <span className="inline-block text-purple-400 animate-pulse hover:scale-110 transition-transform duration-300 relative">
              <span className="inline-block animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>W</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '2s' }}>o</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '2s' }}>r</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2s' }}>d</span>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
            </span>
            <span className="inline-block text-blue-400 ml-2 hover:scale-110 transition-transform duration-300 relative">
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '2s' }}>S</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>t</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2s' }}>a</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '2s' }}>k</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2s' }}>e</span>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute -top-3 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
            </span>
            
            {/* Floating sparkles around the text */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-70" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '1.2s' }}></div>
              <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1.8s' }}></div>
              <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '2.4s' }}></div>
              <div className="absolute bottom-0 right-1/5 w-1 h-1 bg-cyan-300 rounded-full animate-pulse opacity-55" style={{ animationDelay: '0.8s' }}></div>
            </div>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
            The ultimate word game where intelligence meets blockchain. Compete, stake, and earn rewards while expanding your vocabulary.
          </p>
          
          {/* Sample Game Demo */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 max-w-4xl mx-auto border border-gray-700">
            {/* <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-4 sm:mb-6 text-purple-300">Live Demo - Form Words</h3> */}
            
            {/* Letters Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3 mb-4 sm:mb-6 max-w-2xl mx-auto">
              {sampleLetters.map((letter: string, i: number) => (
                <button
                  key={i}
                  className="aspect-square w-full max-w-[60px] mx-auto bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold text-sm sm:text-base lg:text-lg transform hover:scale-110 transition-all flex items-center justify-center relative"
                >
                  {letter.toUpperCase()}
                  <span className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {letterPoints[letter]}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="text-center space-y-2">
              {/* <p className="text-sm sm:text-base text-gray-400">Sample words: WORDS (11pts), STORK (9pts), ROADS (6pts)</p> */}
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">Total: 26 Points</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <button className="w-full sm:w-auto group bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
              <span>Play Solo</span>
            </button>
            <button className="w-full sm:w-auto group bg-pink-600 hover:bg-pink-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" />
              <span>Multiplayer Battle</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-16 text-purple-400">
            Game Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature: Feature, i: number) => (
              <div
                key={i}
                className="group bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all transform hover:scale-105 hover:bg-gray-800/50 cursor-pointer"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`text-purple-400 mb-4 sm:mb-6 transform transition-all duration-300 ${hoveredCard === i ? 'scale-110 rotate-12' : ''}`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-800/20">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-yellow-400">
            Weekly Rewards
          </h3>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 border border-gray-700">
            <div className="flex justify-center mb-6 sm:mb-8">
              <TrophyIcon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-yellow-400" />
            </div>
            <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Leaderboard Champion</h4>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-green-400 mb-4 sm:mb-6">$5 USD</p>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              The highest scoring player each week wins $5 directly to their wallet
            </p>
          </div>
        </div>
      </section>

      {/* Multiplayer Stakes */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-16 text-cyan-400">
            Stake & Win
          </h3>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="mb-6 sm:mb-8">
                <BlockchainIcon className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400 mb-4" />
                <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">How Staking Works</h4>
              </div>
              <div className="space-y-4 sm:space-y-6">
                {[
                  "Players stake SOL tokens to enter multiplayer games",
                  "All stakes are pooled together for the match",
                  "Highest scorer takes the entire pool",
                  "Winnings are automatically transferred to your wallet"
                ].map((text: string, i: number) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700">
                <h5 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Sample Game Pool</h5>
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((player: number) => (
                    <div key={player} className="flex justify-between items-center py-3 px-4 bg-gray-700/50 rounded-lg">
                      <span className="text-sm sm:text-base">Player {player}</span>
                      <span className="text-green-400 font-semibold text-sm sm:text-base">0.1 SOL</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-600 pt-4 mt-4 sm:mt-6">
                    <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                      <span>Winner Takes:</span>
                      <span className="text-yellow-400">0.3 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Ready to Play?</h3>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of players in the most exciting word game on the blockchain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Start Playing Now</span>
            </button>
            <button className="w-full sm:w-auto border border-purple-500 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base lg:text-lg font-semibold hover:bg-purple-500/10 transition-all flex items-center justify-center space-x-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>View Leaderboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <WordIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold">WordStake</span>
          </div>
          <p className="text-sm sm:text-base text-gray-400 text-center sm:text-right">
            © 2025 WordStake. Built on Solana blockchain.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WordStakeLanding;