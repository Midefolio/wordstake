import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Crown, Play, X, Eye, Sparkles, Trophy, Target, Home, Star, Frown, TrendingDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import useUserAuthContext from "../../../hook/userUserAuthContext";
import { isSending, notifyError } from "../../../utils/useutils";
import { makeRequest } from "../../../hook/useApi";
import { claimRewardsApi, startGameApi, updateGamerApi, updateplayerApi } from "../../../api";
import { setCurrentUser } from "../../../states/userSlice";
import { db } from "../../../dexieDB";


const PostGame = ({ validationResults, currentUser, clearCurrentGameState }: any) => {
    const [showValidWords, setShowValidWords] = useState(false);
    const { gameCode } = useParams();
    const [rewardsClaimed, setRewardsClaimed] = useState(false);
    const { token } = useUserAuthContext();
    const pointsEarned = validationResults?.finalScore || 0;
    const Navigation = useNavigate();

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

    const getPerformanceMessage = (points: any) => {
        if (points >= 1000) return "Legendary! 🏆👑";
        if (points >= 800) return "Outstanding! 🎯";
        if (points >= 600) return "Excellent! 🏆";
        if (points >= 400) return "Great Job! ⭐";
        if (points >= 200) return "Good Work! 👍";
        if (points === 0) return "Better luck next time! 💪";
        return "Good Work! 💪";
    };
    
    const updateScore = async() => {
        isSending(true, " ");
        const { res } = await makeRequest('POST', updateplayerApi, {gameCode, playerPubKey:currentUser?.pubkey, updateData:{playerScore:pointsEarned, isPlayed:true}}, () => { isSending(false, "")}, token, null, "json");
        if (res) {
          await clearCurrentGameState();
        }
      }

    const SeeScoreBoard = async () => {
      Navigation(`/multiplayer/results/${gameCode}`)
    };

    const goToDashboard = () => {
        Navigation('/wordstake')
        // Implement navigation to dashboard
    };

    useEffect(()=> {
     if(gameCode && currentUser){
         updateScore();
     }
    }, [gameCode, currentUser])


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
                            Game Over !
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            {getPerformanceMessage(pointsEarned)}
                        </p>

                        {/* Rewards Display */}
                        {!rewardsClaimed ? (
                            <motion.button
                                className={`inline-flex items-center space-x-3 px-8 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${pointsEarned === 0
                                        ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-400/30 hover:from-red-500/30 hover:to-orange-500/30'
                                        : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30 hover:from-yellow-500/30 hover:to-orange-500/30'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={SeeScoreBoard}
                                transition={{ delay: 0.5, type: "spring" }}
                            >
                                <span className="text-xl font-bold text-white">
                                 See Who Won
                                </span>
                                {/* <img className='h-8 w-8 object-contain' src="https://img.icons8.com/?size=100&id=OFHwDWASQWmX&format=png&color=000000" alt="coins" />
                                <span className={`text-3xl font-black ${pointsEarned === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {pointsEarned}
                                </span> */}
                            </motion.button>
                        ) : (
                            <motion.div
                                className={`inline-flex items-center space-x-3 px-8 py-4 rounded-2xl backdrop-blur-sm border ${pointsEarned === 0
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
                            <h2 className="text-xl font-bold text-white">Your Performance </h2>
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
                    </motion.div>
                </motion.div>
            </div>

         
            {/* Valid Words Modal */}
            {/* <AnimatePresence> */}
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
                                        {validationResults.validWords.map((word: any, index: any) => (
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
            {/* </AnimatePresence> */}

         
        </div>
    );

};

export default PostGame;