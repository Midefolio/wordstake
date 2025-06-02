
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Clock, Trophy, Zap, Target, Sparkles, RotateCcw, 
  Check, X, Star, Brain, Crown, Medal, Gift, Users, Volume2, VolumeX,
  BookOpen, Lightbulb, User, Coins, Edit3
} from 'lucide-react';
import words from 'an-array-of-english-words';

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

interface LetterUsage {
  [key: string]: number;
}

interface PlayerProfile {
  name: string;
  totalCoins: number;
}

interface ScorePopup {
  id: number;
  score: number;
  word: string;
  x: number;
  y: number;
  isNegative?: boolean;
}

const WordStakeGame: React.FC = () => {
  // Player profile state
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>({
    name: 'Player',
    totalCoins: 100
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');

  // Power-ups state
  const [dictionaryUsed, setDictionaryUsed] = useState<boolean>(false);
  const [expoUsed, setExpoUsed] = useState<boolean>(false);
  const [suggestedWord, setSuggestedWord] = useState<string>('');

  // Score animation state
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const popupIdRef = useRef<number>(0);

  // Audio setup
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wowSoundRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  
  // List of background music files
  const backgroundMusic = ['/m5.mp3', '/m1.mp3', '/m2.mp3', '/m3.mp3', '/m4.mp3', '/m6.mp3' ];
  
  // Game state for music
  const [gamePhase, setGamePhase] = useState<'menu' | 'playing' | 'results'>('menu');
  
  const letterPoints = {
    'a': 1, 'e': 1, 'i': 1, 'o': 1, 'u': 1, 'n': 1, 'r': 1, 't': 1, 'l': 1, 's': 1,
    'c': 2, 'd': 2, 'g': 2, 'h': 2, 'm': 2, 'p': 2,
    'b': 3, 'f': 3, 'w': 3, 'y': 3,
    'k': 4, 'v': 4,
    'j': 5, 'x': 5,
    'q': 8, 'z': 8
  };

  const [gameLetters, setGameLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [wordsFound, setWordsFound] = useState<WordObject[]>([]);
  const [submittedWords, setSubmittedWords] = useState<Set<string>>(new Set());
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [letterUsage, setLetterUsage] = useState<LetterUsage>({});
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [invalidWordFeedback, setInvalidWordFeedback] = useState<string>('');

  // Initialize audio on component mount
  useEffect(() => {
    // Start with menu music (first song)
    setCurrentSongIndex(0);
    setGamePhase('menu');
    
    // Create audio element with first song
    audioRef.current = new Audio(backgroundMusic[0]);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Set volume to 30%
    
    // Create wow sound effect
    wowSoundRef.current = new Audio('/wow.mp3');
    wowSoundRef.current.volume = 0.6; // Set volume to 60%
    
    // Start playing menu music immediately
    audioRef.current.play().catch(console.error);
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (wowSoundRef.current) {
        wowSoundRef.current = null;
      }
    };
  }, []);

  // Function to play wow sound
  const playWowSound = () => {
    if (wowSoundRef.current && !isMuted) {
      wowSoundRef.current.currentTime = 0; // Reset to beginning
      wowSoundRef.current.play().catch(console.error);
    }
  };

  // Function to create score popup animation
  const createScorePopup = (score: number, word: string, isNegative: boolean = false) => {
    const popup: ScorePopup = {
      id: popupIdRef.current++,
      score: Math.abs(score),
      word,
      x: Math.random() * 200 - 100, // Random x offset between -100 and 100
      y: 0,
      isNegative
    };
    
    setScorePopups(prev => [...prev, popup]);
    
    // Remove popup after animation completes
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popup.id));
    }, 2000);
  };

  // Animated score counter effect
  useEffect(() => {
    const difference = totalScore - animatedScore;
    if (difference !== 0) {
      const increment = difference > 0 ? Math.ceil(difference / 10) : Math.floor(difference / 10);
      const timer = setTimeout(() => {
        setAnimatedScore(prev => prev + increment);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [totalScore, animatedScore]);

  // Function to change song
  const changeSong = (phase: 'menu' | 'playing' | 'results') => {
    if (!audioRef.current) return;
    
    let newIndex: number;
    
    switch (phase) {
      case 'menu':
        newIndex = 0; // Always use first song for menu
        break;
      case 'playing':
        // Use second song for gameplay, or cycle through if multiple games played
        newIndex = 1 + (Math.floor(Date.now() / 1000) % (backgroundMusic.length - 1));
        break;
      case 'results':
        // Use a different song for results, avoid current one
        newIndex = (currentSongIndex + 2) % backgroundMusic.length;
        break;
      default:
        newIndex = 0;
    }
    
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

  // Toggle mute function
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

  // Handle music changes based on game state
  useEffect(() => {
    if (gameStarted && !gameEnded) {
      // Game is playing - change to gameplay music
      changeSong('playing');
    } else if (gameEnded) {
      // Game ended - change to results music
      changeSong('results');
    } else {
      // Back to menu - change to menu music
      changeSong('menu');
    }
  }, [gameStarted, gameEnded]);

  // Create word set for validation
  const wordSet = React.useMemo(() => new Set(words.map(word => word.toLowerCase())), []);

  // Player name editing functions
  const startEditingName = () => {
    setTempName(playerProfile.name);
    setIsEditingName(true);
  };

  const saveName = () => {
    if (tempName.trim()) {
      setPlayerProfile(prev => ({ ...prev, name: tempName.trim() }));
    }
    setIsEditingName(false);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setTempName('');
  };

  // Dictionary function
  const useDictionary = () => {
    if (playerProfile.totalCoins >= 20 && !dictionaryUsed && currentWord.length >= 2) {
      const isValidWord = wordSet.has(currentWord.toLowerCase());
      setDictionaryUsed(true);
      setPlayerProfile(prev => ({ ...prev, totalCoins: prev.totalCoins - 20 }));
      
      // Show feedback for 3 seconds
      setTimeout(() => setDictionaryUsed(false), 3000);
      
      return isValidWord;
    }
    return false;
  };

  // Generate a valid word suggestion using available letters
  const generateWordSuggestion = (letters: string[]): string => {
    const availableLetters = letters.join('').toLowerCase();
    const possibleWords = words.filter(word => {
      if (word.length < 3 || word.length > 8) return false;
      
      const wordLetters = word.toLowerCase().split('');
      const letterCount: { [key: string]: number } = {};
      
      // Count available letters
      for (const letter of availableLetters) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
      }
      
      // Check if word can be formed
      for (const letter of wordLetters) {
        if (!letterCount[letter] || letterCount[letter] === 0) {
          return false;
        }
        letterCount[letter]--;
      }
      
      return true;
    });
    
    // Return a random word from possible words, prioritizing longer ones
    const sortedWords = possibleWords.sort((a, b) => b.length - a.length);
    return sortedWords[Math.floor(Math.random() * Math.min(5, sortedWords.length))] || '';
  };

  // Expo function
  const useExpo = () => {
    if (playerProfile.totalCoins >= 100 && !expoUsed && gameStarted) {
      const suggestion = generateWordSuggestion(gameLetters);
      if (suggestion) {
        setSuggestedWord(suggestion);
        setExpoUsed(true);
        setPlayerProfile(prev => ({ ...prev, totalCoins: prev.totalCoins - 100 }));
        
        // Clear suggestion after 10 seconds
        setTimeout(() => setSuggestedWord(''), 10000);
      }
    }
  };

  // Generate random letters with better distribution
  const generateRandomLetters = (): void => {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const letters: string[] = [];
    const usage: LetterUsage = {};
    
    // Ensure at least 2 vowels
    for (let i = 0; i < 2; i++) {
      const letter = vowels[Math.floor(Math.random() * vowels.length)];
      letters.push(letter);
      usage[letter] = (usage[letter] || 0) + 1;
    }
    
    // Add 6 consonants
    for (let i = 0; i < 6; i++) {
      const letter = consonants[Math.floor(Math.random() * consonants.length)];
      letters.push(letter);
      usage[letter] = (usage[letter] || 0) + 1;
    }
    
    // Shuffle the letters
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    setGameLetters(letters);
    setLetterUsage(usage);
  };

  // Start game
  const startGame = (): void => {
    generateRandomLetters();
    setGameStarted(true);
    setGameEnded(false);
    setWordsFound([]);
    setSubmittedWords(new Set());
    setCurrentWord('');
    setCurrentScore(0);
    setTotalScore(0);
    setAnimatedScore(0);
    setTimeLeft(120);
    setValidationResults(null);
    setSelectedLetters([]);
    setDictionaryUsed(false);
    setExpoUsed(false);
    setSuggestedWord('');
    setInvalidWordFeedback('');
    setScorePopups([]);
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameEnded && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded, timeLeft]);

  // Calculate word score
  const calculateWordScore = (word: string): number => {
    return word.split('').reduce((sum, letter) => sum + (letterPoints[letter] || 0), 0);
  };

  // Update current score when current word changes
  useEffect(() => {
    setCurrentScore(calculateWordScore(currentWord));
  }, [currentWord]);

  // Add letter to current word (mouse click)
  const addLetter = (letter: string, index: number): void => {
    if (!gameStarted || gameEnded) return;
    
    // Check if this specific letter instance is already selected
    if (selectedLetters.includes(index)) return;
    
    setCurrentWord(prev => prev + letter);
    setSelectedLetters(prev => [...prev, index]);
    
    // Clear any invalid word feedback when typing
    if (invalidWordFeedback) {
      setInvalidWordFeedback('');
    }
  };

  // Remove last letter
  const removeLastLetter = (): void => {
    if (!gameStarted || gameEnded || currentWord.length === 0) return;
    
    setCurrentWord(prev => prev.slice(0, -1));
    setSelectedLetters(prev => prev.slice(0, -1));
    
    // Clear any invalid word feedback when editing
    if (invalidWordFeedback) {
      setInvalidWordFeedback('');
    }
  };

  // Clear current word
  const clearWord = (): void => {
    if (!gameStarted || gameEnded) return;
    setCurrentWord('');
    setSelectedLetters([]);
    setInvalidWordFeedback('');
  };

  // Submit word - MODIFIED TO INCLUDE PENALTY FOR INVALID WORDS
  const submitWord = (): void => {
    if (!gameStarted || gameEnded || currentWord.length < 2) return;
    
    // Check if word was already submitted
    if (submittedWords.has(currentWord.toLowerCase())) {
      setInvalidWordFeedback('Word already submitted!');
      setTimeout(() => setInvalidWordFeedback(''), 2000);
      return;
    }
    
    // Check if word is valid BEFORE adding it
    const isValidWord = wordSet.has(currentWord.toLowerCase());
    
    if (isValidWord) {
      // Only add valid words to the game
      const wordScore = calculateWordScore(currentWord);
      const coinsEarned = wordScore; // 1 coin per point
      const newWord: WordObject = {
        word: currentWord,
        score: wordScore,
        timestamp: Date.now()
      };
      
      // Play wow sound
      playWowSound();
      
      // Create score popup animation
      createScorePopup(coinsEarned, currentWord, false);
      
      setWordsFound(prev => [...prev, newWord]);
      setSubmittedWords(prev => new Set([...prev, currentWord.toLowerCase()]));
      setTotalScore(prev => prev + wordScore);
      setPlayerProfile(prev => ({ ...prev, totalCoins: prev.totalCoins + coinsEarned }));
      
      // Clear suggested word if it was used
      if (suggestedWord.toLowerCase() === currentWord.toLowerCase()) {
        setSuggestedWord('');
      }
    } else {
      // Deduct 1 point for invalid word (only if score is above 0)
      const penalty = 1;
      if (totalScore > 0) {
        setTotalScore(prev => Math.max(0, prev - penalty));
        setPlayerProfile(prev => ({ ...prev, totalCoins: Math.max(0, prev.totalCoins - penalty) }));
        
        // Create negative score popup animation
        createScorePopup(penalty, currentWord, true);
      }
      
      // Show feedback for invalid word
      setInvalidWordFeedback(`"${currentWord.toUpperCase()}" is not a valid word! ${totalScore > 0 ? '-1 coin penalty' : ''}`);
      setTimeout(() => setInvalidWordFeedback(''), 3000);
    }
    
    // Always clear the current word after submission attempt
    setCurrentWord('');
    setSelectedLetters([]);
  };

  // End game and validate words - SIMPLIFIED SINCE ALL WORDS ARE ALREADY VALID
  const endGame = useCallback(() => {
    setGameEnded(true);
    setGameStarted(false);
    
    // Since we only add valid words during gameplay, all words in wordsFound are valid
    const validWords: ValidationResult[] = wordsFound.map(wordObj => ({
      ...wordObj,
      isValid: true
    }));
    
    const invalidWords: ValidationResult[] = []; // No invalid words since we validate before adding
    const finalScore = totalScore; // Total score is already calculated from valid words only
    
    setValidationResults({
      validWords,
      invalidWords,
      finalScore,
      totalWordsSubmitted: wordsFound.length
    });
  }, [wordsFound, totalScore]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if word is duplicate
  const isDuplicateWord = (): boolean => {
    return submittedWords.has(currentWord.toLowerCase());
  };

  // Check if current word is valid (for dictionary feedback)
  const isCurrentWordValid = (): boolean => {
    return wordSet.has(currentWord.toLowerCase());
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameEnded) return;
      
      const key = e.key.toLowerCase();
      
      if (key === 'enter') {
        submitWord();
      } else if (key === 'backspace') {
        removeLastLetter();
      } else if (key === 'escape') {
        clearWord();
      } else if (key.match(/[a-z]/) && key.length === 1) {
        // Find first available instance of this letter
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
  }, [gameStarted, gameEnded, selectedLetters, currentWord, submittedWords]);






  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">

          {/* Score Popup Animations */}
           {/* Score Popup Animations */}
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
              <div className={`px-6 py-3 rounded-full font-bold text-xl shadow-2xl border-4 border-white ${
                popup.isNegative 
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
                    className={`absolute w-2 h-2 rounded-full ${
                      popup.isNegative ? 'bg-red-300' : 'bg-yellow-300'
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



        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-4 mt-3 md:mt-10">
            <div className="bg-purple-600 flex rounded-xl items-center justify-center p-3 gap-2">
              <Sparkles className="w-6 h-6" /> 
              <span className='text-sm font-bold'>WordStake</span>
            </div>
           
            {/* Music Control Button */}
            <motion.button
              onClick={toggleMute}
              className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={isMuted ? "Unmute Music" : "Mute Music"}
            >
              {isMuted ? <VolumeX className="w-6 h-6 text-gray-400" /> : <Volume2 className="w-6 h-6 text-blue-400" />}
            </motion.button>
          </div>

          {/* Player Profile */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-sm"
                        maxLength={20}
                        onKeyPress={(e) => e.key === 'Enter' && saveName()}
                        autoFocus
                      />
                      <button onClick={saveName} className="text-green-400 hover:text-green-300">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEditingName} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{playerProfile.name}</span>
                      <button onClick={startEditingName} className="text-gray-400 hover:text-white">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="text-sm text-gray-400">Player</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-yellow-900/30 px-4 py-2 rounded-lg border border-yellow-600">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-400">{playerProfile.totalCoins}</span>
                <span className="text-sm text-yellow-300">coins</span>
              </div>
            </div>
          </div>
        </motion.div>

        {!gameStarted && !gameEnded && (
          <motion.div 
            className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gray-400 mb-5">Create words using the given letters to earn coins!</p>
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
            <p className="text-gray-400 mb-6">You have 2 minutes to form as many valid words as possible!</p>
            <motion.button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg text-xl font-semibold hover:scale-105 transition-all flex items-center space-x-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6" />
              <span>Start Game</span>
            </motion.button>
          </motion.div>
        )}

        {gameStarted && (
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="flex justify-between lg:justify-center gap-4">
              <div className="bg-gray-800/50 flex flex-col gap-1 h-25 w-30 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
                <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-2"/>
                <div className="text-sm font-bold text-yellow-400">{formatTime(timeLeft)}</div>
                <div className="text-xs text-gray-400">Time Left</div>
              </div>
              <div className="bg-gray-800/50 flex flex-col gap-1 h-25 w-30 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
                <Coins className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-green-400">{totalScore}</div>
                <div className="text-xs text-gray-400">Session Coins</div>
              </div>
              <div className="bg-gray-800/50 flex flex-col gap-1 h-25 w-30 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
                <Star className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-blue-400">{wordsFound.length}</div>
                <div className="text-xs text-gray-400">Words</div>
              </div>
            </div>

            {/* Power-ups */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-400" />
                Power-ups
              </h3>
              <div className="flex gap-3 flex-wrap">
                <motion.button
                  onClick={useDictionary}
                  disabled={playerProfile.totalCoins < 20 || currentWord.length < 2}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    playerProfile.totalCoins >= 20 && currentWord.length >= 2
                      ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                  whileHover={playerProfile.totalCoins >= 20 && currentWord.length >= 2 ? { scale: 1.05 } : {}}
                  whileTap={playerProfile.totalCoins >= 20 && currentWord.length >= 2 ? { scale: 0.95 } : {}}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Dictionary (20 coins)</span>
                </motion.button>
                
                <motion.button
                  onClick={useExpo}
                  disabled={playerProfile.totalCoins < 100 || expoUsed}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    playerProfile.totalCoins >= 100 && !expoUsed
                      ? 'bg-yellow-600 hover:bg-yellow-700 cursor-pointer'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                  whileHover={playerProfile.totalCoins >= 100 && !expoUsed ? { scale: 1.05 } : {}}
                  whileTap={playerProfile.totalCoins >= 100 && !expoUsed ? { scale: 0.95 } : {}}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Expo (100 coins)</span>
                </motion.button>
              </div>
              
              {/* Dictionary feedback */}
              {dictionaryUsed && (
                <motion.div 
                  className={`mt-3 p-3 rounded-lg border ${
                    isCurrentWordValid() 
                      ? 'bg-green-900/30 border-green-600 text-green-400' 
                      : 'bg-red-900/30 border-red-600 text-red-400'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2">
                    {isCurrentWordValid() ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span className="font-semibold">
                      "{currentWord.toUpperCase()}" is {isCurrentWordValid() ? 'valid' : 'not valid'}
                    </span>
                  </div>
                </motion.div>
              )}
              
              {/* Expo suggestion */}
              {suggestedWord && (
                <motion.div 
                  className="mt-3 p-3 rounded-lg border bg-yellow-900/30 border-yellow-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-semibold">Suggested word: "{suggestedWord.toUpperCase()}"</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Available Letters */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-400" />
                Available Letters
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {gameLetters.map((letter, index) => (
                  <motion.button
                    key={index}
                    onClick={() => addLetter(letter, index)}
                    className={`w-14 h-14 rounded-lg font-bold text-xl transition-all ${
                      selectedLetters.includes(index)
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

            {/* Current Word */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Current Word
                </h3>
                <div className="text-lg">
                  Coins: <span className="font-bold text-yellow-400">{currentScore}</span>
                  </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-4 p-4 rounded-lg border-2 border-dashed min-h-[80px] flex items-center justify-center ${
                  currentWord 
                    ? isDuplicateWord() 
                      ? 'border-red-400 bg-red-900/20 text-red-400' 
                      : 'border-purple-400 bg-purple-900/20 text-purple-400'
                    : 'border-gray-600 text-gray-500'
                }`}>
                  {currentWord.toUpperCase() || 'TYPE YOUR WORD...'}
                </div>
                {isDuplicateWord() && (
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
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      currentWord.length > 0
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
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      currentWord.length > 0
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
                    disabled={currentWord.length < 2 || isDuplicateWord()}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      currentWord.length >= 2 && !isDuplicateWord()
                        ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    whileHover={currentWord.length >= 2 && !isDuplicateWord() ? { scale: 1.05 } : {}}
                    whileTap={currentWord.length >= 2 && !isDuplicateWord() ? { scale: 0.95 } : {}}
                  >
                    Submit
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Words Found */}
            {wordsFound.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-gold-400" />
                  Words Found ({wordsFound.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {wordsFound.map((wordObj, index) => (
                      <motion.div
                        key={index}
                        className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded-lg border border-gray-600"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="font-semibold text-purple-400">{wordObj.word.toUpperCase()}</div>
                        <div className="text-sm text-yellow-400">{wordObj.score} coins</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Results */}
        {gameEnded && validationResults && (
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
              <div className="text-xl text-gray-400">
                Final Score: <span className="text-yellow-400 font-bold">{validationResults.finalScore}</span> coins
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Valid Words */}
              <div className="bg-green-900/20 rounded-xl p-6 border border-green-600">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-green-400">
                  <Check className="w-5 h-5 mr-2" />
                  Valid Words ({validationResults.validWords.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validationResults.validWords.map((wordObj, index) => (
                    <div key={index} className="flex justify-between items-center bg-green-800/20 p-2 rounded">
                      <span className="font-semibold text-green-300">{wordObj.word.toUpperCase()}</span>
                      <span className="text-green-400">+{wordObj.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invalid Words */}
              <div className="bg-red-900/20 rounded-xl p-6 border border-red-600">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-red-400">
                  <X className="w-5 h-5 mr-2" />
                  Invalid Words ({validationResults.invalidWords.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {validationResults.invalidWords.map((wordObj, index) => (
                    <div key={index} className="flex justify-between items-center bg-red-800/20 p-2 rounded">
                      <span className="font-semibold text-red-300">{wordObj.word.toUpperCase()}</span>
                      <span className="text-red-400">-{wordObj.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-700/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Medal className="w-5 h-5 mr-2 text-purple-400" />
                Performance Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{validationResults.totalWordsSubmitted}</div>
                  <div className="text-sm text-gray-400">Total Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{validationResults.validWords.length}</div>
                  <div className="text-sm text-gray-400">Valid Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{validationResults.finalScore}</div>
                  <div className="text-sm text-gray-400">Final Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {validationResults.totalWordsSubmitted > 0 
                      ? Math.round((validationResults.validWords.length / validationResults.totalWordsSubmitted) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg text-xl font-semibold hover:scale-105 transition-all flex items-center space-x-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-6 h-6" />
                <span>Play Again</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div 
          className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            How to Play
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="font-semibold text-white mb-2">Basic Rules:</h4>
              <ul className="space-y-1">
                <li>• Form words using the given letters</li>
                <li>• Each letter can only be used once per word</li>
                <li>• Minimum word length: 2 letters</li>
                <li>• Valid words earn coins, invalid words lose coins</li>
                <li>• No duplicate words allowed</li>
                <li>• -1 point for every wrong word submitted</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Controls:</h4>
              <ul className="space-y-1">
                <li>• Click letters or use keyboard</li>
                <li>• Press Enter to submit word</li>
                <li>• Press Backspace to remove last letter</li>
                <li>• Press Escape to clear current word</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WordStakeGame;