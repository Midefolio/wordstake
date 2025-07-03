import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Users, Star, Crown, Timer } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../states';
import { isSending } from '../../utils/useutils';
import { makeRequest } from '../../hook/useApi';
import { getGameMultiplayerApi, updateGameApi } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import useUserAuthContext from '../../hook/userUserAuthContext';

const GameResults = () => {
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const {token} = useUserAuthContext();
    const { gameCode } = useParams();
    const Navigate = useNavigate();
     const [gameData, setGameData] = useState({
    title: "Word Master Challenge",
    gameType: "word-game",
    gameStatus: "ongoing", // "pending", "ongoing", "ended"
    currency: "GOR",
    stake: 50, // Set to null/undefined for no stake
    reward: null, // Set to null/undefined for no reward, or set specific reward amount
    duration: 300, // seconds
    players: [
      {
        pubkey: "player1",
        playerName: "Alice Johnson",
        playerScore: 1250,
        profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face",
        isPlayed: true,
        isHost: true,
        isPayed: true
      },
      {
        pubkey: "player2",
        playerName: "Bob Smith",
        playerScore: 980,
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        isPlayed: true,
        isHost: false,
        isPayed: true
      },
      {
        pubkey: "player3",
        playerName: "Carol Davis",
        playerScore: 0,
        profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        isPlayed: true,
        isHost: false,
        isPayed: true
      },
      {
        pubkey: "player4",
        playerName: "David Wilson",
        playerScore: 1180,
        profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        isPlayed: true,
        isHost: false,
        isPayed: true
      }
    ]
  });

    const fetchGameDetails = async () => {
        isSending(true, 'Fetching game...');
        const { res, error } = await makeRequest("POST", getGameMultiplayerApi, { gameCode }, () => { isSending(false, "") }, token, null, "json");
        if (res) {
            setGameData(res.data);
        };
        if(error){
           Navigate("/wordstake")
        }
    }

    useEffect(() => {
        fetchGameDetails();
    }, [gameCode]);



    // Calculate the actual reward based on the rules
    const calculateReward = () => {
        const { stake, reward, players } = gameData;

        // If both stake and reward don't exist, no reward
        if (!stake && !reward) return null;

        // If only reward exists, use the reward value
        if (reward && !stake) return reward;

        // If only stake exists, reward = stake * number of players
        if (stake && !reward) return stake * players?.length;

        // If both exist, prioritize reward (you can change this logic if needed)
        return reward;
    };

    const actualReward = calculateReward();
    const hasReward = actualReward !== null && actualReward > 0;

    // Sort players by score (highest first) but keep unplayed players at bottom
    const sortedPlayers = [...gameData?.players].sort((a, b) => {
        if (!a.isPlayed && !b.isPlayed) return 0;
        if (!a.isPlayed) return 1;
        if (!b.isPlayed) return -1;
        return b.playerScore - a.playerScore;
    });

    const playedPlayers = gameData?.players.filter((p:any) => p.isPlayed);
    const unplayedPlayers = gameData?.players.filter((p:any) => !p.isPlayed);
    const allPlayersPlayed = unplayedPlayers?.length === 0;
    const winner = allPlayersPlayed ? sortedPlayers[0] : null;

    const getStatusColor = (status:any) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 bg-yellow-100';
            case 'ongoing': return 'text-blue-500 bg-blue-100';
            case 'ended': return 'text-green-500 bg-green-100';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const getRankIcon = (index:any, isWinner:any) => {
        if (isWinner) return <Crown className="w-5 h-5 text-yellow-500" />;
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-600" />;
        if (index === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
        if (index === 2) return <Trophy className="w-5 h-5 text-amber-600" />;
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
    };

    const handleClaimReward = () => {
        // Add your reward claiming logic here
        console.log('Claiming reward for winner:', winner?.playerName);
        // You can dispatch an action, make an API call, etc.
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-900/90 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700"
            >
                {gameData && <>{/* Header */}
                <div className="bg-gray-900/90 p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{gameData?.title}</h1>
                            <div className="flex items-center gap-4 text-purple-100">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {gameData?.players?.length} Players
                                </span>
                                {gameData?.stake && (
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4" />
                                        {gameData?.stake} {gameData?.currency}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(gameData?.gameStatus)}`}>
                                {gameData?.gameStatus.charAt(0).toUpperCase() + gameData?.gameStatus?.slice(1)}
                            </span>
                            {hasReward && (
                                <div className="mt-2 text-right">
                                    <div className="text-2xl font-bold text-white">{actualReward} {gameData?.currency}</div>
                                    <div className="text-sm text-purple-200">Total Reward</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Winner Announcement */}
                <AnimatePresence>
                    {allPlayersPlayed && winner && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-yellow-400/80 to-orange-500 p-6 text-white text-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: 2 }}
                                className="inline-block mb-2"
                            >
                                <Crown className="w-12 h-12 mx-auto" />
                            </motion.div>
                            {winner?.pubkey === currentUser?.pubkey ?  <h2 className="text-3xl font-bold mb-2">🎉 You Won! 🎉</h2> :  <h2 className="text-3xl font-bold mb-2">🎉 Winner! 🎉</h2> }
                           
                            <p className="text-xl mb-4">
                                <span className="font-bold">{winner?.playerName}</span> wins with {winner?.playerScore} points!
                            </p>

                            {/* Claim Reward Button - only show if there's a reward */}
                            {hasReward && winner?.pubkey === currentUser?.pubkey && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    onClick={handleClaimReward}
                                    className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                >
                                    🏆 Claim Your {actualReward} {gameData.currency} Reward
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Waiting Message */}
                {!allPlayersPlayed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-700 border-l-4 border-blue-400 p-4 m-6 rounded-lg"
                    >
                        <div className="flex items-center">
                            <Timer className="w-5 h-5 text-blue-400 mr-3" />
                            <div>
                                <p className="text-gray-100 font-medium">Waiting for other players to complete their games</p>
                                <p className="text-gray-300 text-sm mt-1">
                                    {unplayedPlayers.length} player{unplayedPlayers.length !== 1 ? 's' : ''} still need to play
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Players List */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
                        <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                        Leaderboard
                    </h3>

                    <div className="space-y-4">
                        {sortedPlayers?.map((player, index) => {
                            const isTopPlayer = allPlayersPlayed && index === 0;
                            const playedIndex = playedPlayers.findIndex((p:any) => p.pubkey === player.pubkey);
                            const displayIndex = player.isPlayed ? playedIndex : sortedPlayers.length - 1;

                            return (
                                <motion.div
                                    key={player.pubkey}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${isTopPlayer
                                            ? 'border-yellow-400 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 shadow-lg'
                                            : player.isPlayed
                                                ? 'border-gray-600 bg-gray-700 hover:shadow-md hover:bg-gray-600'
                                                : 'border-gray-600 bg-gray-700/50'
                                        }`}
                                >
                                    <div className="flex items-center p-4">
                                        {/* Rank */}
                                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center mr-4">
                                            {player.isPlayed ? getRankIcon(displayIndex, isTopPlayer) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <div className="flex-shrink-0 mr-4">
                                            <div className="relative">
                                                <img
                                                    src={player.profilePicture}
                                                    alt={player.playerName}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-white shadow-lg"
                                                />
                                                {player.isHost && (
                                                    <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                                        H
                                                    </div>
                                                )}
                                                {!player.isPayed && (
                                                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                        !
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Player Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <h4 className="text-lg font-bold text-gray-100 truncate">
                                                        {player.playerName}
                                                        {player.isHost && <span className="ml-2 text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full">Host</span>}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-sm px-2 py-1 rounded-full ${player.isPlayed
                                                                ? 'bg-green-900/50 text-green-300'
                                                                : 'bg-yellow-900/50 text-yellow-300'
                                                            }`}>
                                                            {player.isPlayed ? 'Completed' : 'Pending'}
                                                        </span>
                                                        {!player.isPayed && (
                                                            <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full">
                                                                Payment Required
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className="text-right flex-shrink-0">
                                                    {player.isPlayed ? (
                                                        <div className={`text-2xl font-bold ${isTopPlayer ? 'text-yellow-400' : 'text-gray-100'
                                                            }`}>
                                                            {player.playerScore.toLocaleString()}
                                                        </div>
                                                    ) : (
                                                        <div className="text-2xl font-bold text-gray-500">---</div>
                                                    )}
                                                    <div className="text-sm text-gray-400">points</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Winner Glow Effect */}
                                    {isTopPlayer && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-orange-200/20"
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Game Stats */}
                <div className="bg-gray-50 px-6 py-4 border-t">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{playedPlayers.length}</div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{unplayedPlayers.length}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {playedPlayers?.length > 0 ? Math.max(...playedPlayers.map((p:any) => p.playerScore)).toLocaleString() : 0}
                            </div>
                            <div className="text-sm text-gray-600">Highest Score</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {playedPlayers.length > 0 ? Math.round(playedPlayers.reduce((sum:any, p:any) => sum + p.playerScore, 0) / playedPlayers.length).toLocaleString() : 0}
                            </div>
                            <div className="text-sm text-gray-600">Average</div>
                        </div>
                    </div>
                </div></>}
            </motion.div>
        </div>
    );
};

export default GameResults;