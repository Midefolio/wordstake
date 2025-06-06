import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Crown, Play, X, Eye, Sparkles, Trophy, Target, Home, Star, Frown, TrendingDown } from "lucide-react";
import useUserAuthContext from "../../hook/userUserAuthContext";
import { isSending, notifyError } from "../../utils/useutils";
import { makeRequest } from "../../hook/useApi";
import { claimRewardsApi, startGameApi, updateGamerApi } from "../../api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../../states/userSlice";
import { db } from "../../dexieDB";


const PostGame = ({ validationResults, startGame, currentUser, clearCurrentGameState }:any) => {
    const [showValidWords, setShowValidWords] = useState(false);
    const [playAgain, setPlayAgain] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showWoefulModal, setShowWoefulModal] = useState(false);
    const [rewardsClaimed, setRewardsClaimed] = useState(false);
    const dispatch = useDispatch();
    const Navigate = useNavigate();

    // Mock data for demonstration


    // Play success sound
    const playSuccessSound = () => {
        // Create audio context for success sound
        const audioContext = new (window.AudioContext || window.AudioContext)();
        
        // Create a success sound using Web Audio API
        const createTone = (freq:any, duration:any, volume = 0.3) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };

        // Success melody
        setTimeout(() => createTone(523.25, 0.2), 0);    // C
        setTimeout(() => createTone(659.25, 0.2), 150);  // E
        setTimeout(() => createTone(783.99, 0.2), 300);  // G
        setTimeout(() => createTone(1046.5, 0.4), 450);  // C (high)
    };

    // Play woeful sound
    const playWoefulSound = () => {
        const audioContext = new (window.AudioContext || window.AudioContext)();
        
        const createTone = (freq:any, duration:any, volume = 0.2) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };

        // Woeful melody (descending tones)
        setTimeout(() => createTone(440, 0.3), 0);    // A
        setTimeout(() => createTone(369.99, 0.3), 200);  // F#
        setTimeout(() => createTone(293.66, 0.5), 400);  // D
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const sparkleVariants = {
        animate: {
            rotate: 360,
            scale: [1, 1.2, 1],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const successPopupVariants = {
        hidden: {
            opacity: 0,
            scale: 0.5,
            rotateY: 180
        },
        visible: {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 300,
                duration: 0.8
            }
        },
        exit: {
            opacity: 0,
            scale: 0.5,
            rotateY: -180,
            transition: {
                duration: 0.5
            }
        }
    };

    const woefulModalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.5,
            y: 50
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.6
            }
        },
        exit: {
            opacity: 0,
            scale: 0.5,
            y: 50,
            transition: {
                duration: 0.4
            }
        }
    };

    const confettiVariants = {
        animate: {
            y: [0, -100, 0],
            rotate: [0, 360],
            opacity: [1, 1, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.5
            }
        }
    };

    const getPerformanceMessage = (points:any) => {
        if (points >= 1000) return "Legendary! 🏆👑";
        if (points >= 800) return "Outstanding! 🎯";
        if (points >= 600) return "Excellent! 🏆";
        if (points >= 400) return "Great Job! ⭐";
        if (points >= 200) return "Good Work! 👍";
        if (points === 0) return "Better luck next time! 💪";
        return "Keep Practicing! 💪";
    };

    const { token, pubkey } = useUserAuthContext();
    const pointsEarned = validationResults?.finalScore || 0;

 const claimRewards = async () => {
  if (rewardsClaimed) return;

  if(pointsEarned === 0) {
     setRewardsClaimed(true);
     setShowWoefulModal(true);
     playWoefulSound();
     setPlayAgain(true);
     await clearCurrentGameState();
     return
  }
  
  isSending(true, "Claiming...");
  
  const { res, error } = await makeRequest(
    "POST", 
    claimRewardsApi, 
    { rewardCoins: pointsEarned }, 
    () => { isSending(false, "") }, 
    token, 
    null, 
    "urlencoded"
  );
  
  if (res) {
    setRewardsClaimed(true);
    setShowSuccessPopup(true);
    playSuccessSound();
    
    // Fixed: Use proper increment syntax and ensure we're using currentUser.coins
    const newDetails = {
      ...currentUser,
      totalGames: (currentUser.totalGames || 0) + 1,
      coins: (currentUser.coins) + pointsEarned,  // Use currentUser.coins instead of coins variable
      isPlaying: false,
      currentGame: {}
    };
    
    await db.cached_data.put(res.data, `gamer_${pubkey}`);
    dispatch(setCurrentUser(newDetails));
    
    if (clearCurrentGameState) {
      await clearCurrentGameState();
    }
    
    setPlayAgain(true);
  } else {
    // Added error handling
    console.error('Failed to claim rewards:', error);
    isSending(false, ""); // Reset loading state on error
  }

  if(error && error === "") {
     notifyError("game not found.");
      await clearCurrentGameState();
     Navigate('/wordstake')
  }
};

    const Navigation = useNavigate();
    const goToDashboard = () => {
        Navigation('/wordstake')
        // Implement navigation to dashboard
    };


      const cancelPendingGame = async () => {
        isSending(true, "please wait...");
        const { res } = await makeRequest("POST", updateGamerApi, {
          currentGame: {
            gameId: "",
            gameType: ""
          },
          isPlaying: false
        },
          () => { isSending(false, ""); },
          token,
          null,
          "urlencoded");
    
        if (res) {
          await clearCurrentGameState();
          Navigate('/wordstake')
        }
      };


      const initializeGame = async () => {
        isSending(true, "Initializing game...");
        const {res} =  await makeRequest(
          "POST",
           startGameApi,
            {currentGame:{gameId:"", gameType:"solo"},
             isPlaying:false}, 
             ()=>{isSending(false, "")}, token, null, "urlencoded");
        if(res) {
          await startGame()
        }
      }

    const handleStartGame = async () => {
        setShowSuccessPopup(false);
        setShowWoefulModal(false);
        await initializeGame();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-3 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <motion.button
                            onClick={goToDashboard}
                            className="flex items-center space-x-3 text-white/80 hover:text-white transition-all duration-300 group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                        </motion.button>

                        {/* <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3 bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center relative">
                                    {currentUser?.profilePicture?.secure_url ? (
                                        <img className="w-10 h-10 rounded-full object-cover" src={currentUser.profilePicture.secure_url} alt="Profile" />
                                    ) : (
                                        <span className="text-white font-bold text-sm">{currentUser?.username?.[0] || 'P'}</span>
                                    )}
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                </div>
                                <span className="font-semibold text-white">{currentUser?.username || 'Player'}</span>
                            </div>
                        </div> */}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-32 px-6 lg:px-8 max-w-4xl mx-auto relative z-10 mb-40">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Header Section */}
                    <motion.div variants={itemVariants} className="text-center">
                        <motion.div
                            variants={sparkleVariants}
                            className="inline-block mb-6"
                        >
                            {pointsEarned === 0 ? (
                                <Frown className="w-20 h-20 text-red-400 drop-shadow-2xl" />
                            ) : (
                                <Crown className="w-20 h-20 text-yellow-400 drop-shadow-2xl" />
                            )}
                        </motion.div>
                        <h1 className=" text-4xl lg:text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                            Game Complete!
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            {getPerformanceMessage(pointsEarned)}
                        </p>
                        
                        {/* Rewards Display */}
                        {!rewardsClaimed ? (
                            <motion.button 
                                className={`inline-flex items-center space-x-3 px-8 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                                    pointsEarned === 0 
                                        ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/30 hover:from-red-500/30 hover:to-orange-500/30' 
                                        : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30 hover:from-yellow-500/30 hover:to-orange-500/30'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={claimRewards}
                                transition={{ delay: 0.5, type: "spring" }}
                            >
                                {pointsEarned === 0 ? (
                                    <TrendingDown className="w-6 h-6 text-red-400" />
                                ) : (
                                    <Sparkles className="w-6 h-6 text-yellow-400" />
                                )}
                                <span className="text-xl font-bold text-white">
                                    {pointsEarned === 0 ? 'No Rewards' : 'Claim Rewards'}
                                </span>
                                <img className='h-8 w-8 object-contain' src="https://img.icons8.com/?size=100&id=OFHwDWASQWmX&format=png&color=000000" alt="coins" />
                                <span className={`text-3xl font-black ${pointsEarned === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {pointsEarned}
                                </span>
                            </motion.button>
                        ) : (
                            <motion.div 
                                className={`inline-flex items-center space-x-3 px-8 py-4 rounded-2xl backdrop-blur-sm border ${
                                    pointsEarned === 0 
                                        ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/30' 
                                        : 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/30'
                                }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                            >
                                {pointsEarned === 0 ? (
                                    <Frown className="w-6 h-6 text-red-400" />
                                ) : (
                                    <Check className="w-6 h-6 text-emerald-400" />
                                )}
                                <span className="text-sm lg:text-2xl font-bold text-white">
                                    {pointsEarned === 0 ? 'No Rewards!' : 'Rewards Claimed!'}
                                </span>
                                <img className='h-8 w-8 object-contain' src="https://img.icons8.com/?size=100&id=OFHwDWASQWmX&format=png&color=000000" alt="coins" />
                                <span className={`text-3xl font-black ${pointsEarned === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {pointsEarned}
                                </span>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Performance Stats */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <Trophy className="w-6 h-6 mr-3 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Performance Summary</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                            <motion.div 
                                className="text-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(16, 185, 129, 0.15)" }}
                            >
                                <div className="text-4xl font-black text-emerald-400 mb-2">{validationResults?.validWords?.length || 0}</div>
                                <div className="text-xs lg:text-sm font-medium text-gray-300">Valid Words</div>
                            </motion.div>
                            
                            <motion.div 
                                className="text-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(245, 158, 11, 0.15)" }}
                            >
                                <div className="text-4xl font-black text-yellow-400 mb-2">{pointsEarned}</div>
                                <div className="text-xs lg:text-sm font-medium text-gray-300">Points Earned</div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            onClick={() => setShowValidWords(true)}
                            className="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 backdrop-blur-sm border border-white/20"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Eye className="w-5 h-5" />
                            <span>View Valid Words</span>
                        </motion.button>
                        
                        {playAgain && (
                            <motion.button
                                onClick={handleStartGame}
                                className="flex z-100 items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-2xl transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Play className="w-5 h-5" />
                                <span>Play Again</span>
                            </motion.button>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Woeful Modal for 0 Points */}
            <AnimatePresence>
                {showWoefulModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-gradient-to-br from-red-900/90 via-orange-800/90 to-red-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-red-400/30 shadow-2xl text-center relative overflow-hidden"
                            variants={woefulModalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl"></div>
                            
                            {/* Woeful Icon */}
                            <motion.div
                                className="relative mb-6"
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: "spring", damping: 10 }}
                            >
                                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center mx-auto relative">
                                    <Frown className="w-10 h-10 text-white" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-red-400"
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                            </motion.div>

                            {/* Woeful Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h3 className="text-2xl lg:text-3xl font-black text-white mb-2">
                                    Oh No! 😔
                                </h3>
                                <p className="text-red-400 text-lg font-semibold mb-2">
                                    You didn't score any points this time!
                                </p>
                                <p className="text-white/80 text-sm mb-6">
                                    Don't worry, everyone has tough games. Practice makes perfect!
                                </p>
                                <div className="flex items-center justify-center space-x-2 mb-6">
                                    <TrendingDown className="w-6 h-6 text-red-400" />
                                    <span className="text-2xl font-black text-red-400">0</span>
                                    <span className="text-white text-sm">points earned</span>
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                className="flex flex-col space-y-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <button
                                    onClick={handleStartGame}
                                    className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105"
                                >
                                    <Play className="w-5 h-5" />
                                    <span>Try Again</span>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setShowWoefulModal(false);
                                        cancelPendingGame();
                                    }}
                                    className="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 backdrop-blur-sm border border-white/20 transform hover:scale-105"
                                >
                                    <Home className="w-5 h-5" />
                                    <span>Go to Dashboard</span>
                                </button>
                            </motion.div>

                            {/* Floating sad elements */}
                            <div className="absolute top-4 right-4">
                                <motion.div
                                    animate={{ rotate: -10, scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <TrendingDown className="w-6 h-6 text-red-400" />
                                </motion.div>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <motion.div
                                    animate={{ rotate: 10, scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                >
                                    <Frown className="w-5 h-5 text-orange-400" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            {/* Success Popup */}
            <AnimatePresence>
                {showSuccessPopup && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Confetti Elements */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                    }}
                                    variants={confettiVariants}
                                    animate="animate"
                                    transition={{ delay: i * 0.1 }}
                                />
                            ))}
                        </div>

                        <motion.div
                            className="bg-gradient-to-br from-emerald-900/90 via-green-800/90 to-emerald-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-emerald-400/30 shadow-2xl text-center relative overflow-hidden"
                            variants={successPopupVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-3xl"></div>
                            
                            {/* Success Icon */}
                            <motion.div
                                className="relative mb-6"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: "spring", damping: 10 }}
                            >
                                <div className="w-10 h-10 w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full flex items-center justify-center mx-auto relative">
                                    <Check className="w-10 h-10 text-white" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-emerald-400"
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>
                            </motion.div>

                            {/* Success Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h3 className="text-xl lg:text-3xl font-black text-white mb-2">
                                    Rewards Claimed!
                                </h3>
                                <p className="text-emerald-400 text-sm lg:text-lg font-semibold mb-2">
                                    Congratulations! 🎉
                                </p>
                                <div className="flex items-center justify-center space-x-2 mb-6">
                                    {/* <img className='h4 w-4 lg:h-8 lg:w-8 object-contain' src="https://img.icons8.com/?size=100&id=OFHwDWASQWmX&format=png&color=000000" alt="coins" /> */}
                                    <span className="text-sm lg:text-2xl font-black text-yellow-400">+{pointsEarned}</span>
                                    <span className="text-white text-xs">coins added to your account!</span>
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                className="flex flex-col z-100 space-y-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <button
                                    onClick={handleStartGame}
                                    className="flex z-100 text-sm items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105"
                                >
                                    <Play className="w-5 h-5" />
                                    <span>Play Again</span>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setShowSuccessPopup(false);
                                        goToDashboard();
                                    }}
                                    className="flex text-sm items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 backdrop-blur-sm border border-white/20 transform hover:scale-105"
                                >
                                    <Home className="w-5 h-5" />
                                    <span>Go to Dashboard</span>
                                </button>
                            </motion.div>

                            {/* Floating Stars */}
                            <div className="absolute top-4 right-4">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                                </motion.div>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <motion.div
                                    animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                                >
                                    <Sparkles className="w-5 h-5 text-emerald-400" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Valid Words Modal */}
            <AnimatePresence>
                {showValidWords && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowValidWords(false)}
                    >
                        <motion.div
                            className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden border border-white/20 shadow-2xl"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <Check className="w-6 h-6 text-emerald-400" />
                                    <h3 className="text-2xl font-bold text-white">Valid Words</h3>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold">
                                        {validationResults?.validWords?.length || 0}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowValidWords(false)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto max-h-96 custom-scrollbar">
                                {validationResults?.validWords?.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {validationResults.validWords.map((word:any, index:any) => (
                                            <motion.div
                                                key={index}
                                                className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 text-center"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <span className="text-white font-semibold capitalize">{word?.word}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-400 text-lg">No valid words found</p>
                                        <p className="text-gray-500 text-sm mt-2">Keep practicing to improve your score!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
};

export default PostGame;