import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Clock,
  Trophy,
  Gamepad2,
  Wallet,
  Copy,
  Share2,
  Play,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  Crown,
  TruckElectricIcon,
  Loader
} from 'lucide-react';
import { isSending, token } from '../../utils/useutils';
import { makeRequest } from '../../hook/useApi';
import { addPlayerMultiplayerApi, getGameMultiplayerApi, updateGameApi } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../states';
import useUserAuthContext from '../../hook/userUserAuthContext';
import { TransferGor } from '../../components/wallet_components';
import { io } from "socket.io-client";

const socket = io("https://wordstake-backend.onrender.com");

const GameJoin = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const Navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [paymentMade, setPaymentMade] = useState(false);
  const { gameCode } = useParams();
  const { token } = useUserAuthContext();
  const onBack = () => {
    Navigate('/wordstake');
  }

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Music files array
  const musicFiles = ['m1.mp3', 'm2.mp3', 'm3.mp3', 'm4.mp3', 'm5.mp3', 'm6.mp3'];

  // Initialize random music on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    const selectedMusic = musicFiles[randomIndex];
    setCurrentMusic(selectedMusic);

    // Create audio element
    const audio = new Audio(`${selectedMusic}`);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    // Auto-play music
    const playMusic = async () => {
      try {
        await audio.play();
        setIsMusicPlaying(true);
      } catch (error) {
        console.log('Auto-play prevented by browser');
        setIsMusicPlaying(false);
      }
    };

    playMusic();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fetchGameDetails = async () => {
    isSending(true, 'Fetching game...');
    const { res, error } = await makeRequest("POST", getGameMultiplayerApi, { gameCode }, () => { isSending(false, "") }, token, null, "json");
    if (res) {
      setGameDetails(res.data);
    };
    if (error) {
      setError(error);
    }
  }

  useEffect(() => {
    fetchGameDetails();
  }, [gameCode]);

  const toggleMusic = async () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsMusicPlaying(true);
        } catch (error) {
          console.log('Failed to play music');
        }
      }
    }
  };

  const changeMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const currentIndex = musicFiles.indexOf(currentMusic);
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * musicFiles.length);
    } while (newIndex === currentIndex && musicFiles.length > 1);

    const newMusic = musicFiles[newIndex];
    setCurrentMusic(newMusic);

    const newAudio = new Audio(`/${newMusic}`);
    newAudio.loop = true;
    newAudio.volume = 0.3;
    audioRef.current = newAudio;

    if (isMusicPlaying) {
      newAudio.play().catch(console.log);
    }
  };

  // const handleJoinGame = async () => {
  //   setJoining(true);
  //   try {
  //     const playerData = {
  //       pubkey: currentUser?.pubkey,
  //       profilePicture: currentUser?.profilePicture?.secure_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  //       playerName: currentUser?.username,
  //       isHost: false,
  //       isPayed: false,
  //     };

  //     const response = await mockJoinGame(gameCode, playerData);
  //     if (response.success) {
  //       setGameDetails(response.data);
  //       setCurrentSlide(2);
  //     }
  //   } catch (err) {
  //     setError('Failed to join game');
  //   } finally {
  //     setJoining(false);
  //   }
  // };

  // const handlePaymentSuccess = () => {
  //   setPaymentMade(true);
  //   // Update payment status in game details
  //   if (gameDetails) {
  //     const updatedPlayers = gameDetails.players.map(player => 
  //       player.pubkey === currentUser?.pubkey 
  //         ? { ...player, isPayed: true }
  //         : player
  //     );
  //     setGameDetails({ ...gameDetails, players: updatedPlayers });
  //   }
  // };

  const copyToClipboard = (text: any) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const getGameTypeIcon = (gameType: any) => {
    switch (gameType) {
      case 'Solo Play':
        return <Gamepad2 className="w-6 h-6" />;
      case 'Host Reward':
        return <Trophy className="w-6 h-6" />;
      case 'Stake & Play':
        return <Users className="w-6 h-6" />;
      default:
        return <Gamepad2 className="w-6 h-6" />;
    }
  };

  const getGameTypeColor = (gameType: any) => {
    switch (gameType) {
      case 'Solo Play':
        return 'from-blue-500 to-cyan-500';
      case 'Host Reward':
        return 'from-purple-500 to-pink-500';
      case 'Stake & Play':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const addPlayer = async (retryCount = 0) => {
    const maxRetries = 3;

    isSending(true, 'Adding you to game...');

    const playerData = {
      pubkey: currentUser?.pubkey,
      playerName: currentUser?.username,
      profilePicture: currentUser?.profilePicture?.secure_url || "https://img.icons8.com/?size=100&id=43211&format=png&color=000000",
    };

    try {
      const { res, error } = await makeRequest(
        "POST",
        addPlayerMultiplayerApi,
        {gameCode, playerData},
        () => { isSending(false, ""); },
        token,
        null,
        "json"
      );

      if (res) {
        setGameDetails(res.data);
        setCurrentSlide(2);
        isSending(false, "");
        return;
      }

      if (error) {
        if (retryCount < maxRetries) {
          console.log(`Attempt ${retryCount + 1} failed, retrying...`);
          // Wait 2 seconds before retrying (you can adjust this delay)
          setTimeout(() => {
            addPlayer(retryCount + 1);
          }, 2000);
        } else {
          console.log('Max retries reached. Stopping attempts.');
          isSending(false, "Failed to add player after 3 attempts");
          // Handle final failure here (show error message, etc.)
        }
      }
    } catch (err) {
      console.error('Error in addPlayer:', err);
      if (retryCount < maxRetries) {
        setTimeout(() => {
          addPlayer(retryCount + 1);
        }, 2000);
      } else {
        isSending(false, "Failed to add player after 3 attempts");
      }
    }
  };

  const startGame = async () => {
    isSending(true, 'Starting game...');
   const { res } = await makeRequest("POST", updateGameApi, {gameCode, hostPubkey:currentUser?.pubkey, updateData:{gameStatus:"ongoing"}}, ()=>{isSending(false, "")}, token, null, "json");
    if(res) {
      Navigate(`/multiplayer/play/${gameCode}`);
    } 
  }

  useEffect(() => {
    if (gameDetails) {
      if (gameDetails?.gameStatus == 'ended') {
        setError('Too late to join. Game has already ended');
        return
      }
      if (gameDetails.players.some((player: any) => player.pubkey === currentUser?.pubkey)) {
        setCurrentSlide(2);
        return
      }
    }
  }, [gameDetails])

    useEffect(() => {
      const eventName = `game-${gameDetails?.gameCode}`;
      const handleGameUpdate = (sanitizedGame: any) => {
        setGameDetails(sanitizedGame);
      };
      socket.on(eventName, handleGameUpdate);
      return () => {
        if (socket) {
          socket.off(eventName, handleGameUpdate);
        }
      };
    }, [socket, gameDetails?.gameCode]);





  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center" style={{
        backgroundImage: 'url(/gameBg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="w-full h-screen bg-black/75 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Game Not Found</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-3 md:p-0" style={{
      backgroundImage: 'url(/gameBg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {gameDetails && (<div className='w-screen h-screen bg-black/75 -mt-10 md:mt-0 md:pt-5 p-10'>
        {/* Music Controls */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMusic}
            className="bg-black/50 backdrop-blur-md border border-gray-700 rounded-full p-3 text-white hover:bg-black/70 transition-all"
            title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
          >
            {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={changeMusic}
            className="bg-black/50 backdrop-blur-md border border-gray-700 rounded-full p-3 text-white hover:bg-black/70 transition-all text-xs font-bold"
            title="Change Music"
          >
            ♪
          </motion.button>

          <div className="bg-black/50 backdrop-blur-md border border-gray-700 rounded-lg px-3 py-1 text-xs text-gray-300">
            {currentMusic.replace('.mp3', '').toUpperCase()}
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto mb-5 mt-5">
          <button
            className='py-2 mb-6 flex gap-2 items-center font-bold text-gray-500 hover:text-white transition-colors'
            onClick={onBack}
          >
            <ArrowLeft size={20} /> Back
          </button>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentSlide >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                  {currentSlide > 1 ? '✓' : '1'}
                </div>
                <span className={`text-sm font-medium ${currentSlide >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>
                  Game Details
                </span>
              </div>
              <div className={`w-16 h-0.5 ${currentSlide >= 2 ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentSlide >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${currentSlide >= 2 ? 'text-purple-400' : 'text-gray-500'}`}>
                  Game Lobby
                </span>
              </div>
            </div>
          </div>

          {/* Slide 1: Game Details */}
          {currentSlide === 1 && gameDetails && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{gameDetails.title}</h2>
                <p className="text-gray-400">Game Code: <span className="text-purple-400 font-mono text-lg">{gameDetails.gameCode}</span></p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Game Info */}
                <div className="space-y-6">
                  <div className="bg-gray-700/30 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getGameTypeColor(gameDetails.gameType)}`}>
                        {getGameTypeIcon(gameDetails.gameType)}
                      </div>
                      Game Information
                    </h3>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Game Type:</span>
                        <span className="font-medium">{gameDetails.gameType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {gameDetails.duration}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Host:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          {gameDetails.host.slice(0, 8)}...{gameDetails.host.slice(-6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Players:</span>
                        <span className="font-medium">{gameDetails.players.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reward:</span>
                        {gameDetails.reward && <span className="font-medium">{gameDetails?.reward}</span>}
                        {gameDetails.stake && <span className="font-medium">{gameDetails?.stake} X total players $GOR </span>}
                        {gameDetails.gameType == 'Solo Play' && <span className="font-medium">No reward</span>}

                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {gameDetails.gameType !== 'Solo Play' && (
                    <div className="bg-gray-700/30 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Payment Information
                      </h3>
                      <div className="space-y-3">
                        {gameDetails.stake && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Stake Amount:</span>
                            <span className="font-bold text-xl text-yellow-400 flex items-center gap-1">
                              {gameDetails.stake}
                              <img src="/image.png" className='w-5 h-5 rounded-full object-cover' alt="GOR" />
                            </span>
                          </div>
                        )}
                        {gameDetails.reward && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Winner's Reward:</span>
                            <span className="font-bold text-xl text-green-400 flex items-center gap-1">
                              {gameDetails.reward}
                              <img src="/image.png" className='w-5 h-5 rounded-full object-cover' alt="GOR" />
                            </span>
                          </div>
                        )}
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm">
                            {gameDetails.gameType === 'Stake & Play'
                              ? 'All players must stake the same amount. Winner takes all stakes.'
                              : 'The host will reward the winner from their own wallet.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}


                </div>

                {/* Current Players */}
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Current Players ({gameDetails.players.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {gameDetails.players.map((player: any, index: number) => (
                      <div key={player.pubkey} className="bg-gray-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <img
                              src={player.profilePicture}
                              alt={player.playerName}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{player.playerName}</p>
                              {player.isHost && (
                                <> <Crown className="w-4 h-4 text-yellow-500" />
                                  <span className='text-sm text-gray-500'>(host)</span></>
                              )}
                              {player.isPayed && gameDetails.gameType !== 'Solo Play' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-gray-400 text-xs">{player.pubkey.slice(0, 8)}...{player.pubkey.slice(-6)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
              {gameDetails?.gameType === 'Stake & Play' ?
                < TransferGor onTransferSuccess={addPlayer} address={gameDetails?.address?.pubKey} initialAmount={gameDetails?.stake} from="join" />
                :
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addPlayer()}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Users className="w-5 h-5" />
                    Join Game
                  </motion.button>
                </div>
              }
            </motion.div>
          )}

          {/* Slide 2: Game Lobby */}
          {currentSlide === 2 && gameDetails && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8"
            >
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <h2 className="text-3xl font-bold text-white">Joined Successfully!</h2>
                </div>
                <p className="text-gray-400">{gameDetails.title}</p>
              </div>

              {/* Payment Required */}
              {/* {gameDetails.gameType !== 'Solo Play' && !paymentMade && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-yellow-400 font-semibold text-lg">Payment Required</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    You need to {gameDetails.gameType === 'Stake & Play' ? 'stake' : 'pay'} {gameDetails.stake || gameDetails.reward} GOR to participate in this game.
                  </p>
                  
                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Amount</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(gameDetails.stake || gameDetails.reward)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <p className="text-2xl font-mono font-bold text-white flex gap-2 items-center">
                      {gameDetails.stake || gameDetails.reward} 
                      <img src="/image.png" className='w-6 h-6 rounded-full object-cover' alt="GOR" />
                    </p>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Wallet Address</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyToClipboard(gameDetails.address?.pubKey)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <p className="text-sm text-blue-400 break-all">{gameDetails.address?.pubKey}</p>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      // onClick={handlePaymentSuccess}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                    >
                      I have made transfer
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                      Transfer via Wallet
                    </motion.button>
                  </div>
                </div>
              )} */}

              {/* Game Info and Players */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">Game Details</h3>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Game Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{gameDetails.gameCode}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(gameDetails.gameCode)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Game Type:</span>
                      <span className="font-medium">{gameDetails.gameType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="font-medium">{gameDetails.duration}</span>
                    </div>
                    {gameDetails.stake && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Staked:</span>
                        <span className="font-bold text-yellow-400">{gameDetails.stake} GOR</span>
                      </div>
                    )}
                    {gameDetails.reward && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reward:</span>
                        <span className="font-bold text-green-400">{gameDetails.reward} GOR</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Winner's Reward:</span>
                      {gameDetails.reward && <span className="font-medium text-green-400">{gameDetails?.reward}</span>}
                      {gameDetails.stake && <span className="font-medium text-green-400">{gameDetails?.stake} X total players $GOR </span>}
                      {gameDetails.gameType == 'Solo Play' && <span className="font-medium text-green-400">No reward</span>}

                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4">
                    Players ({gameDetails.players.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {gameDetails.players.map((player: any) => (
                      <div key={player.pubkey} className="bg-gray-600/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <img
                              src={player.profilePicture}
                              alt={player.playerName}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">{player.playerName}</p>
                                {player.isHost && (
                                  <> <Crown className="w-4 h-4 text-yellow-500" />
                                    <span className='text-sm text-gray-500'>(host)</span></>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {player.isPayed && gameDetails.gameType !== 'Solo Play' && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {!player.isPayed && gameDetails.gameType !== 'Solo Play' && (
                                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs">{player.pubkey.slice(0, 8)}...{player.pubkey.slice(-6)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {gameDetails?.host === currentUser?.pubkey ?
                  <>
                    {gameDetails?.players.length < 2 ?
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={true}
                          className={`px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradint-to-r from-gray-500 to-gray-5  }`}
                        >
                          Waiting for at least 1 more player to Join
                          <div className="loader mb-4 mt-5">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        </motion.button>
                      </>
                      : <><motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all"
                      >
                        <Play className="w-5 h-5" />
                        Start Game
                      </motion.button></>}

                  </>
                  :
                  <>
                    {gameDetails?.gameStatus === "pending" ?
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all"
                      >
                        <Play className="w-5 h-5" />
                        Waiting for host to start Game
                      </motion.button>
                      : <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={()=> {  Navigate(`/multiplayer/play/${gameCode}`);}}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold text-lg flex items-center gap-2 transition-all"
                      >
                        <Play className="w-5 h-5" />
                        Start Game
                      </motion.button>}

                  </>

                }
              </div>
            </motion.div>
          )}
        </div>
      </div>)}
    </div>
  );
}
export default GameJoin;