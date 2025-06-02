import React, { useState, useEffect } from 'react';
import { 
  Play, Users, Trophy, Zap, Clock, Coins, Star, Target, Brain, Sparkles, 
  Menu, X, Settings, LogOut, Wallet, History, TrendingUp, Award, 
  Calendar, User, ChevronRight, Plus, Minus, RefreshCw, Copy,
  Eye, EyeOff, GamepadIcon, Crown, Medal, Gift, Bell, Search
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import ConnectWallet from '../../components/wallet_connect/connection';
import { useSelector } from 'react-redux';
import type { RootState } from '../../states';
import ProfileSetupModal from './component/profileSetUp';

interface UserStats {
  totalGames: number;
  gamesWon: number;
  totalEarnings: number;
  bestScore: number;
  currentRank: number;
  weeklyRank: number;
  wordsFormed: number;
  averageScore: number;
}

interface GameHistory {
  id: string;
  type: 'solo' | 'multiplayer';
  score: number;
  result: 'won' | 'lost' | 'completed';
  earnings: number;
  stake: number;
  date: string;
  opponents?: number;
  duration: string;
}

interface Notification {
  id: string;
  type: 'win' | 'reward' | 'challenge' | 'system';
  message: string;
  time: string;
  read: boolean;
}

const WordStakeDashboard: React.FC = () => {
  const currentUser = useSelector((state:RootState) => state.user.currentUser);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(2.45);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'win', message: 'You won 0.3 SOL in Multiplayer Battle!', time: '2 hours ago', read: false },
    { id: '2', type: 'reward', message: 'Weekly reward of $5 credited to your wallet', time: '1 day ago', read: false },
    { id: '3', type: 'challenge', message: 'WordMaster challenged you to a game', time: '3 hours ago', read: true },
  ]);

  console.log(currentUser)

  const [userStats, setUserStarts] = useState<any>({
    totalGames: "Olosho Ayomide",
    totalEarnings: 24.65,
    bestScore: 2847,
    currentRank: 15,
    weeklyRank: 3,
    wordsFormed: 1456,
  });


  useEffect(() => {
    if(currentUser){
      setUserStarts((prev:any) => ({
        ...prev,
        
      }))
    }
  }, [currentUser])





  const [gameHistory] = useState<GameHistory[]>([
    { id: '1', type: 'multiplayer', score: 2456, result: 'won', earnings: 0.3, stake: 0.1, date: '2025-05-30', opponents: 3, duration: '4:23' },
    { id: '2', type: 'solo', score: 1923, result: 'completed', earnings: 0, stake: 0, date: '2025-05-30', duration: '3:45' },
    { id: '3', type: 'multiplayer', score: 1678, result: 'lost', earnings: 0, stake: 0.05, date: '2025-05-29', opponents: 2, duration: '5:12' },
    { id: '4', type: 'multiplayer', score: 2234, result: 'won', earnings: 0.15, stake: 0.05, date: '2025-05-29', opponents: 2, duration: '4:56' },
    { id: '5', type: 'solo', score: 2103, result: 'completed', earnings: 0, stake: 0, date: '2025-05-28', duration: '4:01' },
  ]);

  const [leaderboard] = useState([
    { rank: 1, player: 'WordMaster', score: 2847, earnings: 15.2, isYou: false },
    { rank: 2, player: 'LetterLord', score: 2643, earnings: 12.8, isYou: false },
    { rank: 3, player: 'You', score: 2456, earnings: 24.65, isYou: true },
    { rank: 4, player: 'VocabViper', score: 2389, earnings: 8.4, isYou: false },
    { rank: 5, player: 'TextTitan', score: 2298, earnings: 6.7, isYou: false },
  ]);

  const sidebarItems = [
    { id: 'overview', icon: <Target className="w-5 h-5" />, label: 'Overview' },
    { id: 'play', icon: <Play className="w-5 h-5" />, label: 'Play Game' },
    { id: 'history', icon: <History className="w-5 h-5" />, label: 'Game History' },
    { id: 'leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard' },
    { id: 'wallet', icon: <Wallet className="w-5 h-5" />, label: 'Wallet' },
    { id: 'achievements', icon: <Award className="w-5 h-5" />, label: 'Achievements' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const StatCard: React.FC<{ title: string; value: string; subtitle?: string; icon: React.ReactNode; color: string; trend?: string }> = 
    ({ title, value, subtitle, icon, color, trend }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-green-400 text-sm font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Nick Name"
          value={currentUser?.username  || "Unknown Player"}
          subtitle={""}
          icon={<User className="w-5 h-5" />}
          color="bg-blue-600"
          trend=""
        />
        <StatCard
          title="Best Score"
          value={currentUser?.bestScore?.toLocaleString()}
          subtitle="Personal record"
          icon={<Star className="w-5 h-5" />}
          color="bg-yellow-600"
        />
        <StatCard
          title="Total Earnings"
          value={`${currentUser?.totalEarning} USDC`}
          subtitle="≈ $98.60 USD"
          icon={<Coins className="w-5 h-5" />}
          color="bg-green-600"
          trend=""
        />
        <StatCard
          title="Current Rank"
          value={`#${currentUser?.weeklyRank}`}
          subtitle={`Weekly: #${currentUser?.weeklyRank}`}
          icon={<Trophy className="w-5 h-5" />}
          color="bg-purple-600"
          trend=""
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Games */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Games</h3>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {gameHistory.slice(0, 4).map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${game.type === 'multiplayer' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {game.type === 'multiplayer' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{game.score.toLocaleString()} points</p>
                    <p className="text-sm text-gray-400">
                      {game.type === 'multiplayer' ? `vs ${game.opponents} players` : 'Solo game'} • {game.duration}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    game.result === 'won' ? 'text-green-400' : 
                    game.result === 'lost' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {game.result === 'won' ? `+${game.earnings} SOL` : 
                     game.result === 'lost' ? `-${game.stake} SOL` : 'No stake'}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(game.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full bg-purple-600 hover:bg-purple-700 p-4 rounded-lg transition-colors flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <Play className="w-5 h-5" />
                <span className="font-semibold">Play Solo</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full bg-pink-600 hover:bg-pink-700 p-4 rounded-lg transition-colors flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Multiplayer</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Daily Challenge</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full border border-gray-600 hover:border-gray-500 p-4 rounded-lg transition-colors flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Challenge Friend</span>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
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
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all group">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Solo Play</h3>
            <p className="text-gray-400 text-sm">Practice and improve your skills</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Entry Fee:</span>
              <span className="text-white">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rewards:</span>
              <span className="text-white">Experience Points</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time Limit:</span>
              <span className="text-white">5 minutes</span>
            </div>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors">
            Start Solo Game
          </button>
        </div>

        {/* Quick Match */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all group">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quick Match</h3>
            <p className="text-gray-400 text-sm">Fast multiplayer battles</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Entry Fee:</span>
              <span className="text-white">0.05 SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Max Players:</span>
              <span className="text-white">4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Prize Pool:</span>
              <span className="text-green-400">~0.2 SOL</span>
            </div>
          </div>
          <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors">
            Find Match
          </button>
        </div>

        {/* Tournament */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all group">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tournament</h3>
            <p className="text-gray-400 text-sm">Compete for bigger prizes</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Entry Fee:</span>
              <span className="text-white">0.1 SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Players:</span>
              <span className="text-white">16/32</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">1st Prize:</span>
              <span className="text-green-400">2.5 SOL</span>
            </div>
          </div>
          <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 rounded-lg font-semibold transition-colors">
            Join Tournament
          </button>
        </div>
      </div>

      {/* Active Games */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Active Games</h3>
        <div className="text-center py-8 text-gray-400">
          <GamepadIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No active games</p>
          <p className="text-sm">Start a new game to see it here</p>
        </div>
      </div>
    </div>
  );

  const WalletTab = () => (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Wallet Balance</h3>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="text-4xl font-bold text-white mb-2">
            {showBalance ? `${currentUser?.coin} SOL` : '••••••'}
          </div>
          <div className="text-gray-400 mb-6">
            {showBalance ? `≈ $${(currentUser?.coin * 40.25).toFixed(2)} USD` : '≈ $•••••'}
          </div>
          
          <div className="flex gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Deposit</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2">
              <Minus className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All</button>
        </div>
        
        <div className="space-y-4">
          {[
            { type: 'win', amount: '+0.3', description: 'Multiplayer win vs 3 players', time: '2 hours ago' },
            { type: 'stake', amount: '-0.1', description: 'Tournament entry fee', time: '1 day ago' },
            { type: 'reward', amount: '+5.0', description: 'Weekly leaderboard reward', time: '2 days ago' },
            { type: 'win', amount: '+0.15', description: 'Quick match victory', time: '3 days ago' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  tx.type === 'win' ? 'bg-green-600' : 
                  tx.type === 'reward' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {tx.type === 'win' ? <TrendingUp className="w-4 h-4" /> : 
                   tx.type === 'reward' ? <Gift className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-semibold text-white">{tx.description}</p>
                  <p className="text-sm text-gray-400">{tx.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.amount} SOL
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LeaderboardTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Global Leaderboard</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Resets in 2d 14h</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {leaderboard.map((player, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-lg ${
              player.isYou ? 'bg-purple-600/20 border border-purple-500' : 'bg-gray-700/30'
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  player.rank === 1 ? 'bg-yellow-500 text-black' : 
                  player.rank === 2 ? 'bg-gray-400 text-black' : 
                  player.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-600'
                }`}>
                  {player.rank <= 3 ? (
                    player.rank === 1 ? <Crown className="w-5 h-5" /> :
                    <Medal className="w-5 h-5" />
                  ) : player.rank}
                </div>
                <div>
                  <p className={`font-semibold ${player.isYou ? 'text-purple-300' : 'text-white'}`}>
                    {player.player}
                  </p>
                  <p className="text-sm text-gray-400">{player.score.toLocaleString()} points</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-400">{player.earnings.toFixed(2)} SOL</p>
                <p className="text-xs text-gray-500">Total earnings</p>
              </div>
            </div>
          ))}
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
      case 'wallet':
        return <WalletTab />;
      case 'leaderboard':
        return <LeaderboardTab />;
      case 'history':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Game History</h3>
            <div className="space-y-4">
              {gameHistory.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${game.type === 'multiplayer' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                      {game.type === 'multiplayer' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{game.score.toLocaleString()} points</p>
                      <p className="text-sm text-gray-400">
                        {game.type === 'multiplayer' ? `vs ${game.opponents} players` : 'Solo game'} • {game.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      game.result === 'won' ? 'text-green-400' : 
                      game.result === 'lost' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {game.result === 'won' ? `+${game.earnings} SOL` : 
                       game.result === 'lost' ? `-${game.stake} SOL` : 'No stake'}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(game.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="text-center py-12 text-gray-400">Coming soon...</div>;
    }
  };

  
  return (
    <>
    <div className="min-h-screen bg-gray-900 text-white">
      {currentUser && !currentUser?.username && <ProfileSetupModal currentUser={currentUser} />}
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">WordStake</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
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
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <ConnectWallet/>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'overview' && 'Your gaming dashboard and statistics'}
                  {activeTab === 'play' && 'Choose your game mode and start playing'}
                  {activeTab === 'wallet' && 'Manage your SOL balance and transactions'}
                  {activeTab === 'leaderboard' && 'See top players and your ranking'}
                  {activeTab === 'history' && 'Review your past games and performance'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-white relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* coins Balance (Header) */}
              <div className="hidden sm:flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                <Coins className="w-4 h-4 text-sm text-yellow-300" />
                <span className="font-semibold">{currentUser?.coins}</span>
              </div>
              
              {/* User Avatar */}
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
    </>
  );
};

export default WordStakeDashboard;