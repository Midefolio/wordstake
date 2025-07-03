import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Users, Clock, Trophy, Gamepad2, Wallet, Copy, Share2, Play, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { isSending, makeid, notifySuccess } from '../../utils/useutils';
import { makeRequest } from '../../hook/useApi';
import useUserAuthContext from '../../hook/userUserAuthContext';
import { TransferGor } from '../../components/wallet_components';
import { appUrl, createMultiplayerApi, deleteMultiplayerApi, getGameMultiplayerApi, hostPendingGamesApi, updateGameApi, updateplayerApi } from '../../api';
import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom';

// Move socket initialization inside component or use lazy initialization
// const socket = io("https://adesina-revemp-be.onrender.com");
const socket = io("https://wordstake-backend.onrender.com");

const GameSetup = ({ setGameMode, currentUser }: any) => {
  // Initialize socket reference
  const [currentSlide, setCurrentSlide] = useState(1);
  const [gameType, setGameType] = useState<number | null>(null);
  const { token } = useUserAuthContext();
  const [gameSettings, setGameSettings] = useState<any>({
    title: '',
    duration:120,
    reward: '',
    stake: ''
  });
  const [players, setPlayers] = useState<any[]>([]);

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [gameData, setGameData] = useState<any>(null);

  const getPendingGames = async () => {
    isSending(true, "Please wait...");
    const { res, error } = await makeRequest('POST', hostPendingGamesApi, { pubKey: currentUser?.pubkey }, () => { isSending(false, "") }, token, null, "urlencoded");
    if( res ) {
        setGameData(res?.data);
    }
    if(error){
      setGameMode('solo')
    }
  }

  useEffect(() => {
    if (currentUser?.pubkey) {
      getPendingGames();
    }
  }, [currentUser?.pubkey]);

  useEffect(() => {
    if (gameData) {
      setGameSettings(gameData);
      if (gameData.gameType === 'Solo Play') {
        setCurrentSlide(5)
      } else {
        if (gameData.hostPayed) {
          setCurrentSlide(5)
        } else {
          setCurrentSlide(4)
        }
      }
    }
}, [gameData]);

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
    audio.volume = 0.3; // Set volume to 30%
    audioRef.current = audio;

    // Auto-play music (note: some browsers require user interaction first)
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

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const player = [{
      pubkey: currentUser?.pubkey,
      profilePicture: currentUser?.profilePicture?.secure_url,
      playerName: currentUser?.username,
      isHost: true,
      isPlayed: false,
    }]
    setPlayers(player)
  }, [currentUser])

  // Toggle music play/pause
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

  // Change to random music
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

    const newAudio = new Audio(`${newMusic}`);
    newAudio.loop = true;
    newAudio.volume = 0.3;
    audioRef.current = newAudio;

    if (isMusicPlaying) {
      newAudio.play().catch(console.log);
    }
  };

  const gameTypes = [
    {
      id: 1,
      title: 'Solo Play',
      description: 'No rewards for winner, Players don\'t stake any $GOR',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Host Reward',
      description: 'Winner gets rewarded by the Host in $GOR',
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Stake & Play',
      description: 'All players stake the same amount of $GOR. Winner takes all stakes',
      icon: <Users className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const durations = [
    { value: 120, label: '2 Minutes' },
    { value: 240, label: '4 Minutes' },
    { value: 360, label: '6 Minutes' }
  ];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const handleNext = () => {
    if (currentSlide < 4) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 1) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleGameTypeSelect = (mode: number) => {
    setGameType(mode);
  };

  const handleSettingsChange = (field: string, value: string) => {
    setGameSettings((prev:any) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifySuccess('copied!')
  };

  const createGame: () => Promise<void> = async () => {
    isSending(true, "Initializing...");
    const gameCode = makeid(6);
    const gameData = { ...gameSettings, host: currentUser?.pubkey, gameType: gameTypes.find(m => m.id === gameType)?.title, players, gameCode };
    const { res, error } = await makeRequest('POST', createMultiplayerApi, gameData, () => { isSending(false, "") }, token, null, "urlencoded");
    if (res) {
      setGameSettings(res?.data[0])
      if(gameData.gameType === 'Solo Play') {
         setCurrentSlide(5);
        return
      }
      handleNext();
    }
  }
  
  const deleteGame: () => Promise<void> = async () => {
    const confirm = window.confirm("Cancel game ? - there's no going back after");
    if(!confirm){return}
    isSending(true, "Cancelling game...");
    const gameData = {gameCode:gameSettings?.gameCode, hostPubkey:gameSettings?.host };
    const { res } = await makeRequest('DELETE', deleteMultiplayerApi, gameData, () => { isSending(false, "") }, token, null, "urlencoded");
    if (res) {
      setGameData(null);
      setGameSettings({
        title: '',
        duration: '2min',
        reward: '',
        stake: ''
      })
      setCurrentSlide(1)
    }
  }
  
  const updatePayment = async() => {
    isSending(true, "processing payment...");
    const { res } = await makeRequest('POST', updateplayerApi, {gameCode:gameSettings?.gameCode, playerPubKey:gameSettings?.host, updateData:{isPayed:true}}, () => { isSending(false, "")}, token, null, "json");
    if (res) {
      setGameSettings(res?.data)
      setCurrentSlide(5)
    }
  }

  // Updated socket listener with better error handling
  useEffect(() => {
    const eventName = `game-${gameSettings?.gameCode}`;
    const handleGameUpdate = (sanitizedGame: any) => {
      setGameSettings(sanitizedGame);
    };
    socket.on(eventName, handleGameUpdate);
    return () => {
      if (socket) {
        socket.off(eventName, handleGameUpdate);
      }
    };
  }, [socket, gameSettings?.gameCode]);
   
  const Navigate = useNavigate()
  const startGame = async () => {
      isSending(true, 'Starting game...');
      const { res } = await makeRequest("POST", updateGameApi, {gameCode:gameSettings?.gameCode, hostPubkey:currentUser?.pubkey, updateData:{gameStatus:"ongoing"}}, ()=>{isSending(false, "")}, token, null, "json");
      if(res) {
        Navigate(`/multiplayer/play/${gameSettings?.gameCode}`);
      } 
    }

  return (
    <div className="bg-gray-950 text-white fle items-cener jstify-center md:p-0" style={{
      backgroundImage: 'url(/gameBg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>


      <div className='w-full h-full bg-black/75 md:mt-0 md:pt-5 p-5'>
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

        <div className="w-full max-w-7xl mx-auto mb-5 mt-5">
          <button className='py- mb-6 flex gap-2 items-center font-bold text-gray-500 z0' onClick={() => { setGameMode('solo') }}><ArrowLeft size={20} /> Back </button>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex itemscenter gap-2 md:gap-10 jstify-between relative mb-6">
              {[
                { step: 1, label: 'Game Type' },
                { step: 2, label: 'Settings' },
                { step: 3, label: 'Preview' },
                { step: 4, label: 'Stake' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col w-20 items-cener z-10">
                  <motion.div
                    className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full text-sm font-bold transition-all duration-300 border-2 ${item.step < currentSlide
                        ? 'bg-pink-600 border-transparent text-white shadow-lg'
                        : item.step === currentSlide
                          ? 'bg-pink-600 border-transparent text-white shadow-lg '
                          : 'bg-gray-950 border-gray-700 text-gray-400'
                      }`}
                    whileHover={{ scale: item.step <= currentSlide ? 1.1 : 1 }}
                    animate={{
                      scale: item.step === currentSlide ? 1.1 : 1,
                      boxShadow: item.step === currentSlide ? '0 0 20px rgba(147, 51, 234, 0.5)' : '0 0 0px rgba(147, 51, 234, 0)'
                    }}
                  >
                    {item.step < currentSlide ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg"
                      >
                        ✓
                      </motion.div>
                    ) : (
                      item.step
                    )}
                  </motion.div>
                  <motion.span
                    className={`text-xs mt-2 font-medium transition-colors ${item.step <= currentSlide ? 'text-purple-400' : 'text-gray-500'
                      }`}
                    animate={{
                      color: item.step <= currentSlide ? '#c084fc' : '#6b7280'
                    }}
                  >
                    {item.label}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Container */}
          <div className="relative h00px] overflw-hidden rounded-2xl">
            {/* <AnimatePresence > */}

            {/* Slide 1: Choose Game Type */}
            {currentSlide === 1 && (
              <motion.div
                key="slide1"
                custom={1}
                // variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="absolute inset-0  backdrop-bl rounded-2xl mb-0 h-max"
              >
                <div className="text-ceter mb-8">
                  <h2 className="text-xl md:text-3xl font-bold text-white md:mb-2">Choose Game Type</h2>
                  <p className="text-gray-400 text-xs mt-1 md:text-sm">Select how you want to play</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3  md:gap-6 mb-8">
                  {gameTypes.map((mode) => (
                    <motion.div
                      key={mode.id}

                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGameTypeSelect(mode.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300  ${gameType === mode.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${mode.color}`}>
                          {mode.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm md:text-xl font-semibold text-white mb-1">{mode.title}</h3>
                          <p className="text-gray-400 text-xs md:text-sm">{mode.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  //   whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={!gameType}
                  className="w-ull px-6 bg-gradient-to-r flex text-xs  items-center  justify-center from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Slide 2: Game Settings */}
            {currentSlide === 2 && (
              <motion.div
                key="slide2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-2xl p-"
              >
                <div className="text-cener mb-8">
                  <h2 className="text-xl md:text-3xl font-bold text-white md:mb-2">Game Settings</h2>
                  <p className="text-gray-400 text-xs mt-1 md:text-sm">Configure your game</p>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Game Title */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Game Title {gameType === 1 && <span className="text-gray-400">(Optional)</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Word Guru"
                      value={gameSettings.title}
                      onChange={(e) => handleSettingsChange('title', e.target.value)}
                      className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Reward/Stake Amount */}
                  {gameType === 2 && (
                    <div>
                      <label className="block text-white font-medium mb-2">Winner's Reward ($Gor)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Enter reward amount"
                        value={gameSettings.reward}
                        onChange={(e) => handleSettingsChange('reward', e.target.value)}
                        className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {gameType === 3 && (
                    <div>
                      <label className="block text-white font-medium mb-2">Stake Amount ($Gor)</label>
                      <input
                        type="number"
                        placeholder="Enter stake amount"
                        value={gameSettings.stake}
                        onChange={(e) => handleSettingsChange('stake', e.target.value)}
                        className="w-full bg-gray-700/30 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Game Duration */}
                  <div>
                    <label className="block text-white font-medium mb-2">Game Duration</label>
                    <div className="flex grid-cols-3 gap-3">
                      {durations.map((duration) => (
                        <motion.button
                          key={duration.value}
                          //   whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSettingsChange('duration', duration.value)}
                          className={`p-3 rounded-lg border backdrop-blur-lg bg-gray-500/20 text-center text-xs md:text-sm transition-all duration-300 ${gameSettings.duration === duration.value
                              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                              : 'border-gray-600 bg-gray-700/30/30 text-gray-300 hover:border-gray-500'
                            }`}
                        >
                          <Clock className="w-5 h-5 mx-auto mb-1" />
                          {duration.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 md:mt-[10%]">
                  <motion.button
                    // whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="w-ull px-6 flex gap-2  text-xs md:text-xl bg-gray-500/20 justify-center items-center py-3 rounded-xl font-semibold transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </motion.button>
                  <motion.button
                    // whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="w-ull px-6 bg-gradient-to-r flex text-xs md:text-xl  items-center  justify-center from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Proceed
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Slide 3: Game Preview */}
            {currentSlide === 3 && (
              <motion.div
                key="slide3"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-ray-800/50 bacdrop-blur-lg boder border-gray-700 rounded-2xl md:mt-10"
              >
                <div className="text-cener mb-8">
                  <h2 className="text-xl md:text-3xl font-bold text-white md:mb-2">Game Details</h2>
                  <p className="text-gray-400 text-xs">Review your game setup</p>
                </div>

                <div className="bg-gray-700/30/30 rounded-xl p6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-white font-medium mb-2">Game Details</h3>
                      <div className="space-y-2 text-gray-300">
                        <p><span className="text-gray-400">Title:</span> {gameSettings.title || 'Untitled Game'}</p>
                        <p><span className="text-gray-400">Mode:</span> {gameTypes.find(m => m.id === gameType)?.title}</p>
                        <p><span className="text-gray-400">Duration:</span> {gameSettings.duration}</p>
                        {gameType === 2 && gameSettings.reward && (
                          <p><span className="text-gray-400">Reward:</span> {gameSettings.reward} $Gor</p>
                        )}
                        {gameType === 3 && gameSettings.stake && (
                          <p><span className="text-gray-400">Stake:</span> {gameSettings.stake} $Gor per player</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-2">Instructions</h3>
                      <div className="space-y-2 text-gray-300">
                        <p className="text-sm">• Minimum 2 players required</p>
                        {(gameType === 2 || gameType === 3) && (
                          <p className="text-sm">• Wallet connection required for payments</p>
                        )}
                        <p className="text-sm">• Player with the highest points Wins</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 md:mt-[10%]">
                  <motion.button
                    // whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBack}
                    className="w-ull px-6 flex gap-2  text-xs md:text-xl bg-gray-500/20 justify-center items-center py-3 rounded-xl font-semibold transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </motion.button>
                  <motion.button
                    // whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createGame}
                    className="w-ull px-6 bg-gradient-to-r flex text-xs md:text-xl  items-center  justify-center from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Proceed
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Slide 4: Game Lobby */}
            {currentSlide === 4 && (
              <motion.div
                key="slide4"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="absoute inset- bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8"
              >
                <div className="text-cente mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{gameSettings?.title}</h2>
                  <p className="text-gray-400">Stake {gameSettings?.stake || gameSettings?.reward}GOR to continue.</p>
                </div>

                <div className=" mb-8">
                  <div>
                    <h3 className="text-white font-medium mb-4">Payment Details</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Amount </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(gameSettings?.stake || gameSettings?.reward)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <p className="text-2xl font-mono font-bold text-white flex gap-2 items-center" title={`${gameSettings?.stake || gameSettings?.reward} GOR`}>{gameSettings?.stake || gameSettings?.reward} <img src="image.png" className='w-6 h-6 rounded-full object-cover' alt="" /></p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">wallet Address</span>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(gameSettings?.address?.pubKey)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-green-400 hover:text-green-300"
                            >
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-sm text-blue-400 break-all">{gameSettings?.address?.pubKey}</p>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="flex justify-between">
                  <TransferGor onTransferSuccess={updatePayment} initialAmount={gameSettings?.stake || gameSettings?.reward} address={gameSettings?.address?.pubKey} />
                </div>
                <div className='pt-6'><button className='p-2 bg-red-500' onClick={deleteGame}>Cancle Game</button></div>

              </motion.div>
            )}

            {/* Slide 5: Game Lobby */}
            {currentSlide === 5 && (
              <motion.div
                key="slide4"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="absoute inset-0 bg-gray-800/10 backdrop-blur-lg border border-gray-700 rounded-2xl p-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{gameSettings?.title}</h2>
                  <p className="text-gray-400">Share the code or link for others to join</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-white font-medium mb-4">Game Access</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Game Code</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyToClipboard(gameSettings?.gameCode)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Copy className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <p className="text-2xl font-mono font-bold text-white">{gameSettings?.gameCode}</p>
                      </div>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Game Link</span>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(`${appUrl}/multiplayer/join/${gameSettings?.gameCode}`)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Share2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-sm text-blue-400 break-all">{`${appUrl}/multiplayer/join/${gameSettings?.gameCode}`}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-4">
                      Players ({gameSettings?.players?.length})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {gameSettings?.players?.map((player:any) => (
                        <div key={player.id} className="bg-gray-700/30 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                             <img src={player.profilePicture} alt="" className='w-full h-full object-cover rounded-full ' />
                            </div>
                            <div className="flex w-full justify-between items-center">
                              <p className="text-white font-medium">{player.playerName} {player.pubkey == currentUser?.pubkey && <span className='text-blue-500'>(host) </span> }</p>
                              <p className="text-gray-400 text-md font-bold">{player?.pubkey?.slice(0, 6)}...</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="fex jutify-between">

                    {gameSettings?.players?.length > 1 ? 
                    
                      <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className={`px-6 py-4 rounded-xl font-semibold flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500 text-white gap-2}`}
                  >
                    <Play className="w-5 h-5" />
                     Start Game
                  </motion.button>
                    : <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={true}
                    className={`px-6 py-4 rounded-xl font-semibold flex items-center justify-center bg-gray-600 text-gray-400 cursor-not-allowed gap-2}`}
                  >
                    <Play className="w-5 h-5" />
                      Waiting for at least 1 more player
                  </motion.button>
                    }

                   {gameSettings?.gameType !== "Solso Play" &&  <div className='pt-10'><button className='p-2 bg-red-500' onClick={deleteGame}>Cancle Game</button></div>}
                </div>
              </motion.div>
            )}

            {/* </AnimatePresence> */}
          </div>
        </div>
      </div>


    </div>
  );
};

export default GameSetup;