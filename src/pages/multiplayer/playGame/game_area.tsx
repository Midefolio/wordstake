import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Target, RotateCcw,
  Check, X, Volume2, VolumeX,
  Lightbulb
} from 'lucide-react';
import words from 'an-array-of-english-words';
import BeforeGame from './beforeGame';
import { useSelector } from 'react-redux';
import PostGame from './after_game';
import type { RootState } from '../../../states';

interface WordObject {
  word: string;
  score: number;
  timestamp: number;
}

interface ValidationResult {
  word: string;
  score: number;
  timestamp: number;
  isValid: boolean;
}

interface ValidationResults {
  validWords: ValidationResult[];
  invalidWords: ValidationResult[];
  finalScore: number;
  totalWordsSubmitted: number;
}

interface ScorePopup {
  id: number;
  score: number;
  word: string;
  x: number;
  y: number;
  isNegative?: boolean;
}

const letterPoints: { [key: string]: number } = {
  'a': 1, 'e': 1, 'i': 1, 'o': 1, 'u': 1, 'n': 1, 'r': 1, 't': 1, 'l': 1, 's': 1,
  'c': 2, 'd': 2, 'g': 2, 'h': 2, 'm': 2, 'p': 2,
  'b': 3, 'f': 3, 'w': 3, 'y': 3,
  'k': 4, 'v': 4,
  'j': 5, 'x': 5,
  'q': 8, 'z': 8
};

const WordStakeGame: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  // Player state
  const [playerProfile, setPlayerProfile] = useState<any>({
    name: 'Player',
    robot: 0,
    dictionary: 0,
    totalCoins: 0,
    bestScore: 0
  });

  // Game state
  const [gamePhase, setGamePhase] = useState<'menu' | 'playing' | 'results'>('playing');
  const [gameLetters, setGameLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [wordsFound, setWordsFound] = useState<WordObject[]>([]);
  const [submittedWords, setSubmittedWords] = useState<Set<string>>(new Set());
  const [totalScore, setTotalScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);

  // Power-ups state
  const [dictionaryUsageCount, setDictionaryUsageCount] = useState<number>(0);
  const [robotUsageCount, setRobotUsageCount] = useState<number>(0);
  const [dictionaryUsed, setDictionaryUsed] = useState<boolean>(false);
  const [expoUsed, setExpoUsed] = useState<boolean>(false);
  const [suggestedWord, setSuggestedWord] = useState<string>('');
  const [suggestedWords, setSuggestedWords] = useState<Set<string>>(new Set());

  // UI state
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [powerUpFeedback, setPowerUpFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [invalidWordFeedback, setInvalidWordFeedback] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);

  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wowSoundRef = useRef<HTMLAudioElement | null>(null);
  const popupIdRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);

  // Constants
  const backgroundMusic = ['/m5.mp3', '/m1.mp3', '/m2.mp3', '/m3.mp3', '/m4.mp3', '/m6.mp3'];
  const wordSet = React.useMemo(() => new Set(words.map(word => word.toLowerCase())), []);

  // Simplified state persistence - only save essential data
  const saveGameState = useCallback(() => {
    if (!gameStarted && !gameEnded) return;

    const gameState = {
      gameStarted,
      gameEnded,
      gamePhase,
      timeLeft,
      gameStartTime: gameStartTimeRef.current,
      gameLetters,
      currentWord,
      wordsFound,
      submittedWords: Array.from(submittedWords),
      totalScore,
      selectedLetters,
      dictionaryUsageCount,
      robotUsageCount,
      validationResults
    };

    try {
      localStorage.setItem('wordStakeGameState', JSON.stringify(gameState));
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }, [gameStarted, gameEnded, gamePhase, timeLeft, gameLetters, currentWord,
    wordsFound, submittedWords, totalScore, selectedLetters,
    dictionaryUsageCount, robotUsageCount, validationResults]);

  const loadGameState = useCallback(() => {
    try {
      const savedState = localStorage.getItem('wordStakeGameState');
      if (!savedState) return false;

      const gameState = JSON.parse(savedState);

      if (!gameState.gameLetters?.length || !gameState.gameStartTime) {
        localStorage.removeItem('wordStakeGameState');
        return false;
      }

      const timePassed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
      const currentTimeLeft = Math.max(0, 120 - timePassed);

      // Restore state
      setGameStarted(gameState.gameStarted);
      setGamePhase(gameState.gamePhase);
      setGameLetters(gameState.gameLetters);
      setCurrentWord(gameState.currentWord || '');
      setWordsFound(gameState.wordsFound || []);
      setSubmittedWords(new Set(gameState.submittedWords || []));
      setTotalScore(gameState.totalScore || 0);
      setSelectedLetters(gameState.selectedLetters || []);
      setDictionaryUsageCount(gameState.dictionaryUsageCount || 0);
      setRobotUsageCount(gameState.robotUsageCount || 0);
      setValidationResults(gameState.validationResults);
      gameStartTimeRef.current = gameState.gameStartTime;

      if (gameState.gameEnded) {
        setGameEnded(true);
        setTimeLeft(0);
      } else if (currentTimeLeft > 0 && gameState.gameStarted) {
        setGameEnded(false);
        setTimeLeft(currentTimeLeft);
      } else {
        // Time expired - end game
        setGameEnded(true);
        setGameStarted(false);
        setTimeLeft(0);
        if (!gameState.validationResults) {
          const results = {
            validWords: (gameState.wordsFound || []).map((w: WordObject) => ({ ...w, isValid: true })),
            invalidWords: [],
            finalScore: gameState.totalScore || 0,
            totalWordsSubmitted: (gameState.wordsFound || []).length
          };
          setValidationResults(results);
        }
      }

      return true;
    } catch (error) {
      console.warn('Failed to load game state:', error);
      localStorage.removeItem('wordStakeGameState');
      return false;
    }
  }, []);


  useEffect(() => {
    if (currentUser) {
      setPlayerProfile(
        {
          name: currentUser?.username,
          robot: currentUser?.expo,
          dictionary: currentUser?.dictionary,
          totalCoins: currentUser?.totalCoins,
          bestScore: 0
        }
      )
    }
  }, [currentUser])


  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem('wordStakeGameState');
    } catch (error) {
      console.warn('Failed to clear game state:', error);
    }
  }, []);

  // Load state on mount
  useEffect(() => {
    const stateRestored = loadGameState();
    if (!stateRestored) {
      setGamePhase('menu');
    }
  }, [loadGameState]);

  // Save state on changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (gameStarted || gameEnded) {
        saveGameState();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [gameStarted, gameEnded, timeLeft, wordsFound, totalScore, saveGameState]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(backgroundMusic[0]);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    audioRef.current.play().catch(console.error);

    wowSoundRef.current = new Audio('/wow.mp3');
    wowSoundRef.current.volume = 0.6;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (wowSoundRef.current) {
        wowSoundRef.current = null;
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  // Simplified timer - runs every second only when needed
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            setTimeout(() => endGame(), 100);
          }
          return newTime;
        });
      }, 1000);
    } else if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, [gameStarted, gameEnded, timeLeft]);

  // Helper functions
  const calculateWordScore = (word: string): number => {
    return word.split('').reduce((sum, letter) => sum + (letterPoints[letter] || 0), 0);
  };

  const getNextDictionaryCost = (): number => 2 * (dictionaryUsageCount + 1);
  const getNextRobotCost = (): number => 2 * (robotUsageCount + 1);

  const canUseDictionary = (): boolean => {
    return playerProfile.dictionary >= getNextDictionaryCost() &&
      !dictionaryUsed && currentWord.length >= 2 && gameStarted && !gameEnded;
  };

  const canUseRobot = (): boolean => {
    return playerProfile.robot >= getNextRobotCost() &&
      !expoUsed && gameStarted && !gameEnded;
  };

  const showPowerUpFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setPowerUpFeedback(message);
    setFeedbackType(type);
    setTimeout(() => setPowerUpFeedback(''), 3000);
  };

  const createScorePopup = (score: number, word: string, isNegative: boolean = false) => {
    const popup: ScorePopup = {
      id: popupIdRef.current++,
      score: Math.abs(score),
      word,
      x: Math.random() * 200 - 100,
      y: 0,
      isNegative
    };

    setScorePopups(prev => [...prev, popup]);
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popup.id));
    }, 2000);
  };

  const playWowSound = () => {
    if (wowSoundRef.current && !isMuted) {
      wowSoundRef.current.currentTime = 0;
      wowSoundRef.current.play().catch(console.error);
    }
  };

  const changeSong = (phase: 'menu' | 'playing' | 'results') => {
    if (!audioRef.current) return;

    let newIndex = phase === 'menu' ? 0 :
      phase === 'playing' ? 1 :
        (currentSongIndex + 1) % backgroundMusic.length;

    if (newIndex !== currentSongIndex) {
      audioRef.current.pause();
      audioRef.current.src = backgroundMusic[newIndex];
      audioRef.current.currentTime = 0;
      if (!isMuted) {
        audioRef.current.play().catch(console.error);
      }
      setCurrentSongIndex(newIndex);
    }
    setGamePhase(phase);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.volume = 0;
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  // Game actions
  const startGame = (duration: any, letters: any): void => {
    clearGameState();
    setGameLetters(letters.letters);
    setGameStarted(true);
    setGameEnded(false);
    setWordsFound([]);
    setSubmittedWords(new Set());
    setCurrentWord('');
    setTotalScore(0);
    setTimeLeft(duration);
    setValidationResults(null);
    setSelectedLetters([]);
    setDictionaryUsed(false);
    setExpoUsed(false);
    setSuggestedWord('');
    setSuggestedWords(new Set());
    setInvalidWordFeedback('');
    setScorePopups([]);
    setPowerUpFeedback('');
    setDictionaryUsageCount(0);
    setRobotUsageCount(0);
    gameStartTimeRef.current = Date.now();
  };

  const endGame = useCallback(() => {
    setGameEnded(true);
    setGameStarted(false);

    const validWords: ValidationResult[] = wordsFound.map(wordObj => ({
      ...wordObj,
      isValid: true
    }));

    const results = {
      validWords,
      invalidWords: [],
      finalScore: totalScore,
      totalWordsSubmitted: wordsFound.length
    };

    setValidationResults(results);

    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, [wordsFound, totalScore]);

  const addLetter = (letter: string, index: number): void => {
    if (!gameStarted || gameEnded || selectedLetters.includes(index)) return;

    setCurrentWord(prev => prev + letter);
    setSelectedLetters(prev => [...prev, index]);
    if (invalidWordFeedback) setInvalidWordFeedback('');
  };

  const removeLastLetter = (): void => {
    if (!gameStarted || gameEnded || currentWord.length === 0) return;
    setCurrentWord(prev => prev.slice(0, -1));
    setSelectedLetters(prev => prev.slice(0, -1));
    if (invalidWordFeedback) setInvalidWordFeedback('');
  };

  const clearWord = (): void => {
    if (!gameStarted || gameEnded) return;
    setCurrentWord('');
    setSelectedLetters([]);
    setInvalidWordFeedback('');
  };

  const submitWord = (): void => {
    if (!gameStarted || gameEnded || currentWord.length < 2) return;

    if (submittedWords.has(currentWord.toLowerCase())) {
      setInvalidWordFeedback('Word already submitted!');
      setTimeout(() => setInvalidWordFeedback(''), 2000);
      return;
    }

    const isValidWord = wordSet.has(currentWord.toLowerCase());

    if (isValidWord) {
      const wordScore = calculateWordScore(currentWord);
      const newWord: WordObject = {
        word: currentWord,
        score: wordScore,
        timestamp: Date.now()
      };

      playWowSound();
      createScorePopup(wordScore, currentWord, false);

      setWordsFound(prev => [...prev, newWord]);
      setSubmittedWords(prev => new Set([...prev, currentWord.toLowerCase()]));
      setTotalScore(prev => prev + wordScore);
      setPlayerProfile((prev: any) => ({ ...prev, totalCoins: prev.totalCoins + wordScore }));

      if (suggestedWord.toLowerCase() === currentWord.toLowerCase()) {
        setSuggestedWord('');
      }
    } else {
      const penalty = 1;
      if (totalScore > 0) {
        setTotalScore(prev => Math.max(0, prev - penalty));
        setPlayerProfile((prev: any) => ({ ...prev, totalCoins: Math.max(0, prev.totalCoins - penalty) }));
        createScorePopup(penalty, currentWord, true);
      }

      setInvalidWordFeedback(`"${currentWord.toUpperCase()}" is not a valid word! ${totalScore > 0 ? '-1 coin penalty' : ''}`);
      setTimeout(() => setInvalidWordFeedback(''), 3000);
    }

    setCurrentWord('');
    setSelectedLetters([]);
  };

  const useDictionary = () => {
    const cost = getNextDictionaryCost();
    if (!canUseDictionary()) return;

    const isValidWord = wordSet.has(currentWord.toLowerCase());
    setDictionaryUsed(true);
    setDictionaryUsageCount(prev => prev + 1);
    setPlayerProfile((prev: any) => ({ ...prev, dictionary: prev.dictionary - cost }));

    showPowerUpFeedback(
      `Dictionary used! Word is ${isValidWord ? 'VALID' : 'INVALID'}`,
      isValidWord ? 'success' : 'error'
    );

    setTimeout(() => setDictionaryUsed(false), 3000);
  };

  const generateWordSuggestion = (letters: string[]): string => {
    const availableLetters = letters.join('').toLowerCase();
    const possibleWords = words.filter(word => {
      if (word.length < 3 || word.length > 8) return false;
      if (suggestedWords.has(word.toLowerCase()) || submittedWords.has(word.toLowerCase())) return false;

      const wordLetters = word.toLowerCase().split('');
      const letterCount: { [key: string]: number } = {};

      for (const letter of availableLetters) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
      }

      for (const letter of wordLetters) {
        if (!letterCount[letter] || letterCount[letter] === 0) return false;
        letterCount[letter]--;
      }

      return true;
    });

    const sortedWords = possibleWords.sort((a, b) => b.length - a.length);
    return sortedWords[Math.floor(Math.random() * Math.min(5, sortedWords.length))] || '';
  };

  const useExpo = () => {
    const cost = getNextRobotCost();
    if (!canUseRobot()) return;

    const suggestion = generateWordSuggestion(gameLetters);
    if (suggestion) {
      setSuggestedWords(prev => new Set([...prev, suggestion.toLowerCase()]));
      setSuggestedWord(suggestion);
      setExpoUsed(true);
      setRobotUsageCount(prev => prev + 1);
      setPlayerProfile((prev: any) => ({ ...prev, robot: prev.robot - cost }));

      showPowerUpFeedback(`Robot used! Suggested: "${suggestion.toUpperCase()}"`, 'success');

      setTimeout(() => {
        setSuggestedWord('');
        setExpoUsed(false);
      }, 10000);
    } else {
      showPowerUpFeedback('No new word suggestions found!', 'error');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameEnded) return;

      const key = e.key.toLowerCase();
      if (key === 'enter') submitWord();
      else if (key === 'backspace') removeLastLetter();
      else if (key === 'escape') clearWord();
      else if (key.match(/[a-z]/) && key.length === 1) {
        const availableIndex = gameLetters.findIndex((letter, index) =>
          letter === key && !selectedLetters.includes(index)
        );
        if (availableIndex !== -1) {
          addLetter(key, availableIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameEnded, selectedLetters, currentWord, gameLetters]);

  // Computed values
  const currentScore = calculateWordScore(currentWord);
  const isDuplicateWord = submittedWords.has(currentWord.toLowerCase());
  const isCurrentWordValid = wordSet.has(currentWord.toLowerCase());
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-[100vw] bg-gray-900 text-white"
      style={{
        backgroundImage: 'url(/gameBg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top',
      }}
    >

      <div className='w-screen h-screen bg-black/40'>

        <div className="maxl mx-ato"  >
          <AnimatePresence>
            {scorePopups.map((popup) => (
              <motion.div
                key={popup.id}
                className="fixed pointer-events-none z-50"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{
                  x: popup.x,
                  y: popup.y,
                  scale: 0.5,
                  opacity: 0
                }}
                animate={{
                  x: popup.x,
                  y: popup.y - 150,
                  scale: [0.5, 1.2, 1],
                  opacity: [0, 1, 1, 0]
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                  scale: {
                    times: [0, 0.3, 0.6, 1],
                    duration: 2
                  }
                }}
              >
                <div className={`px-6 py-3 rounded-full font-bold text-xl shadow-2xl border-4 border-white ${popup.isNegative
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                  }`}>
                  <div className="text-center">
                    <div className="text-sm">{popup.isNegative ? `-${popup.score}` : `+${popup.score}`}</div>
                    <div className="text-xs font-semibold">{popup.word.toUpperCase()}</div>
                  </div>
                </div>

                {/* Sparkle effects */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full ${popup.isNegative ? 'bg-red-300' : 'bg-yellow-300'
                        }`}
                      style={{
                        left: `${20 + i * 10}%`,
                        top: `${20 + (i % 3) * 20}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        repeat: 1,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!gameStarted && !gameEnded && (
            <>
              <BeforeGame clearCurrentGameState={clearGameState} startGame={startGame} currentUser={currentUser} />
            </>
          )}

          {/* GAME AREA */}
          {gameStarted && (
            <>
              <div className="space-y-3 p-2 md:py-20 md:px-40">
                <motion.div
                  className="p-1 pt-4 fxed z-100 w-full flex-col"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="bg-gray-900/90 backdop-blur-sm rounded-full p-2">
                    <div className="flex items-center justify-between">
                      {/* TIME LEFT */}
                      <div className="flex items-center gap-1 bg-gray-900/30 px-4 py-2 rounded-full">
                        <img className='h-6 w-6 object-contain' src="https://img.icons8.com/?size=100&id=WEJ7pr5aHxBo&format=png&color=000000" alt="" />
                        <span className="font-bold text-white-400">{formatTime(timeLeft)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* DICTIONARY */}
                        <motion.button
                          onClick={useDictionary}
                          disabled={!canUseDictionary()}
                          className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${canUseDictionary()
                            ? 'bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 cursor-pointer'
                            : 'bg-gray-900/30 opacity-50 cursor-not-allowed'
                            }`}
                          whileHover={canUseDictionary() ? { scale: 1.05 } : {}}
                          whileTap={canUseDictionary() ? { scale: 0.95 } : {}}
                        >
                          <img className='h-6 w-6 object-contain' src="https://img.icons8.com/?size=100&id=3ZVHr47ogpJp&format=png&color=000000" alt="" />
                          <span className="font-bold text-white-400 text-xs">{playerProfile.dictionary}</span>
                          <span className="text-xs text-gray-400">(-{getNextDictionaryCost()})</span>
                        </motion.button>

                        {/* ROBOT */}
                        <motion.button
                          onClick={useExpo}
                          disabled={!canUseRobot()}
                          className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${canUseRobot()
                            ? 'bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 cursor-pointer'
                            : 'bg-gray-900/30 opacity-50 cursor-not-allowed'
                            }`}
                          whileHover={canUseRobot() ? { scale: 1.05 } : {}}
                          whileTap={canUseRobot() ? { scale: 0.95 } : {}}
                        >
                          <img className='h-6 w-6 object-contain' src="https://img.icons8.com/?size=100&id=6nsw3h9gk8M8&format=png&color=000000" alt="" />
                          <span className="font-bold text-white-400">{playerProfile.robot}</span>
                          <span className="text-xs text-gray-400">(-{getNextRobotCost()})</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-ray-800/50 backdo-blur-sm rounded-ull p-2">
                    <div className="flex items-center justify-between">
                      {/* WORD FOUND */}
                      <div className="flex flex-col items-cnter px-4 py-2 rounded-full">
                        <span className='text-sm md:text-xl text-white font-bold md:text-white'>Word Count</span>
                        <span className="text-sm md:text-xl font-bold text-blue-400">{wordsFound.length}</span>
                      </div>

                      {/* POINTS EARNED */}
                      <div className="flex flex-col items-cnter px-4 py-2 rounded-full">
                        <span className='text-sm md:text-xl text-white font-bold md:text-white'>Points Earned</span>
                        <span
                          className={`text-sm md:text-xl font-bold text-blue-400}`}
                        >
                          {totalScore.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                </motion.div>
                {suggestedWord && (
                  <motion.div
                    className="p-1 inline-block rounded-lg border bg-yellow-900/30 border-yellow-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Lightbulb className="w-4 h-4" />
                      <span className="font-semibold">Suggested word: "{suggestedWord.toUpperCase()}"</span>
                    </div>
                  </motion.div>
                )}

                {dictionaryUsed && (
                  <motion.div
                    className={`p-1 inline-block rounded-lg z-10 border ${isCurrentWordValid
                      ? 'bg-green-900/30 border-green-600 text-green-400'
                      : 'bg-red-900/50 border-red-600 text-red-400'
                      }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2">
                      {isCurrentWordValid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      <span className="font-semibold">
                        "{currentWord.toUpperCase()}" is {isCurrentWordValid ? 'valid' : 'not valid'}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Current Word */}
                <div className="bg-gray-900/90 backdop-blur-sm rounded-xl p-6 brder boder-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-setIsMuted font-semibold flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                      Current Word
                    </h3>
                    <div className="text-sm">
                      points: <span className="font-bold text-yellow-400">{currentScore}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-bold mb-4 p-4 rounded-lg border-2 border-dashed min-h-[10px] flex items-center justify-center ${currentWord
                      ? isDuplicateWord
                        ? 'border-red-400 bg-red-900/20 text-red-400'
                        : 'border-purple-400 bg-purple-900/20 text-purple-400'
                      : 'border-gray-600 text-gray-500'
                      }`}>
                      {currentWord.toUpperCase() || 'TYPE YOUR WORD...'}
                    </div>
                    {isDuplicateWord && (
                      <motion.div
                        className="mb-4 text-red-400 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Word already submitted!
                      </motion.div>
                    )}
                    <div className="flex gap-3 justify-center">
                      <motion.button
                        onClick={removeLastLetter}
                        disabled={currentWord.length === 0}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentWord.length > 0
                          ? 'bg-yellow-600 hover:bg-yellow-700 cursor-pointer'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                          }`}
                        whileHover={currentWord.length > 0 ? { scale: 1.05 } : {}}
                        whileTap={currentWord.length > 0 ? { scale: 0.95 } : {}}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={clearWord}
                        disabled={currentWord.length === 0}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentWord.length > 0
                          ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                          }`}
                        whileHover={currentWord.length > 0 ? { scale: 1.05 } : {}}
                        whileTap={currentWord.length > 0 ? { scale: 0.95 } : {}}
                      >
                        Clear
                      </motion.button>
                      <motion.button
                        onClick={submitWord}
                        disabled={currentWord.length < 2 || isDuplicateWord}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all ${currentWord.length >= 2 && !isDuplicateWord
                          ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                          }`}
                        whileHover={currentWord.length >= 2 && !isDuplicateWord ? { scale: 1.05 } : {}}
                        whileTap={currentWord.length >= 2 && !isDuplicateWord ? { scale: 0.95 } : {}}
                      >
                        Submit
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Available Letters */}
                <div className="bg-gray-900/90 backdrp-blur-sm rounded-xl p-6 bordr brder-gray-700">
                  <h3 className="text-sm font-semibold mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-400" />
                    Available Letters
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {gameLetters.map((letter, index) => (
                      <motion.button
                        key={index}
                        onClick={() => addLetter(letter, index)}
                        className={`w-14 h-14 rounded-lg font-bold text-xl transition-all ${selectedLetters.includes(index)
                          ? 'bg-purple-600 ring-2 ring-purple-400 cursor-not-allowed opacity-70'
                          : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-purple-600 hover:to-pink-600 hover:scale-110 cursor-pointer border border-gray-600 hover:border-purple-400'
                          }`}
                        whileHover={!selectedLetters.includes(index) ? { scale: 1.1 } : {}}
                        whileTap={!selectedLetters.includes(index) ? { scale: 0.9 } : {}}
                        disabled={selectedLetters.includes(index)}
                      >
                        {letter.toUpperCase()}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Game Results */}
          {gameEnded && validationResults && (
            <PostGame clearCurrentGameState={clearGameState} currentUser={currentUser} validationResults={validationResults} startGame={startGame} />
          )}

          {/* Fixed Footer */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradiet-to-t from-gray-900 via-gray-900/90 to-transparent backdrop-blur-lg"></div>
            {/* Animated border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradent-to-r from-transparent via-purple-500/50 to-transparent"></div>
            {/* Main footer content */}
            <div className="relative p-6">
              <div className="max-w-4xl mx-auto">
                {/* Floating button container */}
                <div className="flex items-center justify-center gap-3">
                  {/* Mute Control - Enhanced */}
                  <motion.button
                    onClick={toggleMute}
                    className={`group relative overflow-hidden px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${isMuted
                      ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-400 shadow-lg shadow-red-500/10'
                      : 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 text-green-400 shadow-lg shadow-green-500/10'
                      }`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: isMuted
                        ? '0 10px 30px rgba(239, 68, 68, 0.3)'
                        : '0 10px 30px rgba(34, 197, 94, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Animated background glow */}
                    <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${isMuted ? 'from-red-500 to-red-600' : 'from-green-500 to-emerald-600'
                      }`}></div>

                    <div className="relative flex items-center gap-2">
                      <motion.div
                        animate={!isMuted ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </motion.div>
                      {/* <span className="text-sm font-semibold">
                      {isMuted ? 'Unmute' : 'Mute'}
                    </span> */}
                    </div>

                    {/* Sound wave animation for unmuted state */}
                    {!isMuted && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 bg-green-400 rounded-full opacity-60"
                            style={{ right: i * 4, height: 8 + i * 4 }}
                            animate={{
                              scaleY: [0.5, 1, 0.5],
                              opacity: [0.3, 0.8, 0.3]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>

                  {/* Help Button - Enhanced */}
                  <motion.button
                    onClick={() => {
                      document.querySelector('.instructions')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 text-blue-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/10"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Animated background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                    <div className="relative flex items-center">
                      <motion.div
                        whileHover={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                      </motion.div>
                      <span className="text-sm">Help</span>
                    </div>

                    {/* Floating question marks */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(2)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-blue-300 text-xs opacity-0 group-hover:opacity-60"
                          style={{
                            right: 10 + i * 15,
                            top: 5 + i * 10
                          }}
                          animate={{
                            y: [-5, -15, -5],
                            opacity: [0, 0.6, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                        >
                          ?
                        </motion.div>
                      ))}
                    </div>
                  </motion.button>
                </div>


              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};


export default WordStakeGame;