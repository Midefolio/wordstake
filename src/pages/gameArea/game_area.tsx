import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Target, RotateCcw,
  Check, X, Volume2, VolumeX,
  Lightbulb} from 'lucide-react';
import words from 'an-array-of-english-words';
import BeforeGame from './beforeGame';
import { useSelector } from 'react-redux';
import PostGame from './after_game';
import type { RootState } from '../../states';

interface WordObject {
  word: string;
  score: number;
  timestamp: number;
};

interface ValidationResult {
  word: string;
  score: number;
  timestamp: number;
  isValid: boolean;
};

interface ValidationResults {
  validWords: ValidationResult[];
  invalidWords: ValidationResult[];
  finalScore: number;
  totalWordsSubmitted: number;
};

interface LetterUsage {
  [key: string]: number;
};

interface ScorePopup {
  id: number;
  score: number;
  word: string;
  x: number;
  y: number;
  isNegative?: boolean;
};

interface GameState {
  gameStarted: boolean;
  gameEnded: boolean;
  gamePhase: 'menu' | 'playing' | 'results';
  timeLeft: number;
  gameStartTime: number;
  gameLetters: string[];
  currentWord: string;
  wordsFound: WordObject[];
  submittedWords: string[];
  totalScore: number;
  letterUsage: LetterUsage;
  selectedLetters: number[];
  dictionaryUsageCount: number;
  robotUsageCount: number;
  suggestedWords: string[];
  validationResults: ValidationResults | null;
};

const WordStakeGame: React.FC = () => {
  const currentUser = useSelector((state:RootState) => state.user.currentUser);
  const [playerProfile, setPlayerProfile] = useState<any>({
    name: 'Player',
    robot: 0,
    dictionary: 0,
    totalCoins: 0,
    bestScore:0
  });
  const [dictionaryUsed, setDictionaryUsed] = useState<boolean>(false);
  const [expoUsed, setExpoUsed] = useState<boolean>(false);
  const [suggestedWord, setSuggestedWord] = useState<string>('');
  const [dictionaryUsageCount, setDictionaryUsageCount] = useState<number>(0);
  const [robotUsageCount, setRobotUsageCount] = useState<number>(0);
  const [suggestedWords, setSuggestedWords] = useState<Set<string>>(new Set()); // Track suggested words
  const [powerUpFeedback, setPowerUpFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const popupIdRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wowSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const backgroundMusic = ['/m5.mp3', '/m1.mp3', '/m2.mp3', '/m3.mp3', '/m4.mp3', '/m6.mp3'];
  const [gamePhase, setGamePhase] = useState<'menu' | 'playing' | 'results'>('menu');
  const letterPoints: { [key: string]: number } = {
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

  // Game state persistence functions
  const saveGameState = useCallback(() => {
    const gameState: GameState = {
      gameStarted,
      gameEnded,
      gamePhase,
      timeLeft,
      gameStartTime: Date.now() - (120 - timeLeft) * 1000, // Calculate when game started
      gameLetters,
      currentWord,
      wordsFound,
      submittedWords: Array.from(submittedWords),
      totalScore,
      letterUsage,
      selectedLetters,
      dictionaryUsageCount,
      robotUsageCount,
      suggestedWords: Array.from(suggestedWords),
      validationResults
    };
    
    try {
      localStorage.setItem('wordStakeGameState', JSON.stringify(gameState));
    } catch (error) {
      console.warn('Failed to save game state to localStorage:', error);
    }
  }, [gameStarted, gameEnded, gamePhase, timeLeft, gameLetters, currentWord, wordsFound, 
      submittedWords, totalScore, letterUsage, selectedLetters, dictionaryUsageCount, 
      robotUsageCount, suggestedWords, validationResults]);
  
const loadGameState = useCallback(() => {
  try {
    const savedState = localStorage.getItem('wordStakeGameState');
    if (savedState) {
      const gameState: GameState = JSON.parse(savedState);
      
      // Validate that this is actually a valid game state
      // Check for required properties that indicate a real game was started
      if (!gameState.gameLetters || 
          gameState.gameLetters.length === 0 || 
          !gameState.gameStartTime ||
          typeof gameState.gameStarted !== 'boolean') {
        // Invalid or incomplete game state - remove it and return false
        localStorage.removeItem('wordStakeGameState');
        return false;
      }
      
      // Calculate current time based on when the game was saved
      const timePassed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
      const currentTimeLeft = Math.max(0, 120 - timePassed);
      
      // Always restore the game state first
      setGameStarted(gameState.gameStarted);
      setGamePhase(gameState.gamePhase);
      setGameLetters(gameState.gameLetters);
      setCurrentWord(gameState.currentWord || '');
      setWordsFound(gameState.wordsFound || []);
      setSubmittedWords(new Set(gameState.submittedWords || []));
      setTotalScore(gameState.totalScore || 0);
      setAnimatedScore(gameState.totalScore || 0);
      setLetterUsage(gameState.letterUsage || {});
      setSelectedLetters(gameState.selectedLetters || []);
      setDictionaryUsageCount(gameState.dictionaryUsageCount || 0);
      setRobotUsageCount(gameState.robotUsageCount || 0);
      setSuggestedWords(new Set(gameState.suggestedWords || []));
      setValidationResults(gameState.validationResults);
      
      // Handle different scenarios based on game state and time
      if (gameState.gameEnded) {
        // Game was already ended when saved - restore as is
        setGameEnded(gameState.gameEnded);
        setTimeLeft(gameState.timeLeft || 0);
      } else if (currentTimeLeft > 0 && gameState.gameStarted) {
        // Game is still running - continue with current time
        setGameEnded(false);
        setTimeLeft(currentTimeLeft);
      } else if (gameState.gameStarted) {
        // Time expired while user was away - end the game now
        setGameEnded(true);
        setGameStarted(false);
        setTimeLeft(0);
        
        // Create validation results if they don't exist
        if (!gameState.validationResults) {
          const validWords: ValidationResult[] = (gameState.wordsFound || []).map(wordObj => ({
            ...wordObj,
            isValid: true
          }));
          const invalidWords: ValidationResult[] = [];
          const finalScore = gameState.totalScore || 0;
          const results = {
            validWords,
            invalidWords,
            finalScore,
            totalWordsSubmitted: (gameState.wordsFound || []).length
          };
          
          setValidationResults(results);
          
          // Update the saved state to reflect that game has ended
          const updatedGameState = {
            ...gameState,
            gameEnded: true,
            gameStarted: false,
            timeLeft: 0,
            validationResults: results
          };
          
          try {
            localStorage.setItem('wordStakeGameState', JSON.stringify(updatedGameState));
          } catch (error) {
            console.warn('Failed to update game state in localStorage:', error);
          }
        }
        
        // Change music to results phase
        setTimeout(() => changeSong('results'), 100);
      } else {
        // Game was never properly started - treat as no saved state
        return false;
      }
      
      return true; // Game state was restored
    }
  } catch (error) {
    console.warn('Failed to load game state from localStorage:', error);
    // If there's an error parsing, remove the corrupted data
    try {
      localStorage.removeItem('wordStakeGameState');
    } catch (removeError) {
      console.warn('Failed to remove corrupted game state:', removeError);
    }
  }
  return false; // No game state restored
}, []);

  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem('wordStakeGameState');
    } catch (error) {
      console.warn('Failed to clear game state from localStorage:', error);
    }
  }, []);

  // Load game state on component mount
  useEffect(() => {
    const stateRestored = loadGameState();
    
    // If no state was restored, ensure we're in menu phase
    if (!stateRestored) {
      setGamePhase('menu');
    }
  }, [loadGameState]);

  // Save game state whenever relevant state changes
  useEffect(() => {
    if (gameStarted || gameEnded) {
      saveGameState();
    }
  }, [gameStarted, gameEnded, timeLeft, wordsFound, totalScore, currentWord, 
      selectedLetters, validationResults, saveGameState]);

  // Calculate progressive costs
  const getNextDictionaryCost = (): number => {
    return 2 * (dictionaryUsageCount + 1);
  };

  const getNextRobotCost = (): number => {
    return 2 * (robotUsageCount + 1);
  };

  const canUseDictionary = (): boolean => {
    return playerProfile.dictionary >= getNextDictionaryCost() &&
      !dictionaryUsed &&
      currentWord.length >= 2 &&
      gameStarted &&
      !gameEnded;
  };

  const canUseRobot = (): boolean => {
    return playerProfile.robot >= getNextRobotCost() &&
      !expoUsed &&
      gameStarted &&
      !gameEnded;
  };

  // Show power-up feedback
  const showPowerUpFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setPowerUpFeedback(message);
    setFeedbackType(type);
    setTimeout(() => setPowerUpFeedback(''), 3000);
  };

  // Initialize audio on component mount
  useEffect(() => {
    // Start with menu music (first song)
    setCurrentSongIndex(0);

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
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
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

  // Dictionary function with progressive cost
  const useDictionary = () => {
    const cost = getNextDictionaryCost();

    if (!canUseDictionary()) {
      if (playerProfile.dictionary < cost) {
        showPowerUpFeedback(`Need ${cost} dictionary points! You have ${playerProfile.dictionary}`, 'error');
      } else if (dictionaryUsed) {
        showPowerUpFeedback('Dictionary already used recently!', 'error');
      } else if (currentWord.length < 2) {
        showPowerUpFeedback('Type at least 2 letters first!', 'error');
      }
      return false;
    }

    const isValidWord = wordSet.has(currentWord.toLowerCase());
    setDictionaryUsed(true);
    setDictionaryUsageCount(prev => prev + 1);
    setPlayerProfile((prev:any) => ({
      ...prev,
      dictionary: prev.dictionary - cost
    }));

    // Show feedback with cost information
    const nextCost = 2 * (dictionaryUsageCount + 2);
    showPowerUpFeedback(
      `Dictionary used! Cost: ${cost} points. Next use: ${nextCost} points. Word is ${isValidWord ? 'VALID' : 'INVALID'}`,
      isValidWord ? 'success' : 'error'
    );

    // Clear dictionary used state after 3 seconds
    setTimeout(() => setDictionaryUsed(false), 3000);

    return isValidWord;
  };

  // Generate a valid word suggestion using available letters - UPDATED to exclude previously suggested words
  const generateWordSuggestion = (letters: string[]): string => {
    const availableLetters = letters.join('').toLowerCase();
    const possibleWords = words.filter(word => {
      if (word.length < 3 || word.length > 8) return false;

      // Skip if word was already suggested
      if (suggestedWords.has(word.toLowerCase())) return false;

      // Skip if word was already submitted by player
      if (submittedWords.has(word.toLowerCase())) return false;

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

  // Expo function with progressive cost - UPDATED to track suggested words
  const useExpo = () => {
    const cost = getNextRobotCost();

    if (!canUseRobot()) {
      if (playerProfile.robot < cost) {
        showPowerUpFeedback(`Need ${cost} robot points! You have ${playerProfile.robot}`, 'error');
      } else if (expoUsed) {
        showPowerUpFeedback('Robot already used recently!', 'error');
      }
      return;
    }

    const suggestion = generateWordSuggestion(gameLetters);
    if (suggestion) {
      // Add to suggested words set
      setSuggestedWords(prev => new Set([...prev, suggestion.toLowerCase()]));

      setSuggestedWord(suggestion);
      setExpoUsed(true);
      setRobotUsageCount(prev => prev + 1);
      setPlayerProfile(prev => ({
        ...prev,
        robot: prev.robot - cost
      }));

      // Show feedback with cost information
      const nextCost = 2 * (robotUsageCount + 2);
      showPowerUpFeedback(
        `Robot used! Cost: ${cost} points. Next use: ${nextCost} points. Suggested: "${suggestion.toUpperCase()}"`,
        'success'
      );

      // Clear suggestion after 10 seconds
      setTimeout(() => {
        setSuggestedWord('');
        setExpoUsed(false);
      }, 10000);
    } else {
      showPowerUpFeedback('No new word suggestions found!', 'error');
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

  // Start game - UPDATED to reset suggested words tracking
  const startGame = (): void => {
    // Clear any existing saved state when starting fresh
    clearGameState();
    
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
    setSuggestedWords(new Set()); // Reset suggested words tracking
    setInvalidWordFeedback('');
    setScorePopups([]);
    setPowerUpFeedback('');
    // Reset usage counters for new game
    setDictionaryUsageCount(0);
    setRobotUsageCount(0);
    
    // Update timestamp for timer calculations
    lastUpdateTimeRef.current = Date.now();
  };

  // Updated timer effect with better time tracking
  useEffect(() => {
    if (gameStarted && !gameEnded && timeLeft > 0) {
      gameTimerRef.current = setInterval(() => {
        const now = Date.now();
        const timePassed = Math.floor((now - lastUpdateTimeRef.current) / 1000);
        
        if (timePassed >= 1) {
          setTimeLeft(prev => {
            const newTime = Math.max(0, prev - timePassed);
            if (newTime === 0) {
              setTimeout(() => endGame(), 100);
            }
            return newTime;
          });
          lastUpdateTimeRef.current = now;
        }
      }, 100); // Check more frequently for accuracy
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

    const results = {
      validWords,
      invalidWords,
      finalScore,
      totalWordsSubmitted: wordsFound.length
    };
    
    setValidationResults(results);
    
    // Clear the timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
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

  const [displayScore, setDisplayScore] = useState(1250);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animate score changes
  useEffect(() => {
    if (totalScore !== displayScore) {
      setIsAnimating(true);
      const duration = 800; // Animation duration in ms
      const startTime = Date.now();
      const startScore = displayScore;
      const scoreDiff = totalScore - displayScore;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentScore = Math.round(startScore + (scoreDiff * easeOut));
        setDisplayScore(currentScore);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [totalScore, displayScore])

  const clearCurrentGameState:any = useCallback(() => {
  try {
    localStorage.removeItem('wordStakeGameState');
    console.log('Game state cleared from localStorage');
  } catch (error) {
    console.warn('Failed to clear game state from localStorage:', error);
  }
}, []);

// Updated cancel game function that clears localStorage
const cancelGame = useCallback(() => {
  // Reset all game state
  setGameStarted(false);
  setGameEnded(false);
  setGamePhase('menu');
  setGameLetters([]);
  setCurrentWord('');
  setWordsFound([]);
  setSubmittedWords(new Set());
  setTotalScore(0);
  setAnimatedScore(0);
  setTimeLeft(120);
  setLetterUsage({});
  setSelectedLetters([]);
  setDictionaryUsageCount(0);
  setRobotUsageCount(0);
  setSuggestedWords(new Set());
  setValidationResults(null);
  clearCurrentGameState();
}, [clearGameState]);

  return (
    <div className="min-h-screen w-[100vw] bg-gray-900 text-white"
      style={{
        backgroundImage: 'url(/gameBg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top',
      }}
    >
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
           <BeforeGame clearCurrentGameState={clearCurrentGameState} startGame={startGame} currentUser={currentUser} />
          </>
        )}

        {/* GAME AREA */}
        {gameStarted && (
          <>
            <div className="space-y-3 p-2">
              <motion.div
                className="p-1 pt-4 fxed z-100 w-full flex-col"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-full p-2 ">
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

                <div className="bg-ray-800/50 backdop-blur-sm rounded-ull p-2">
                  <div className="flex items-center justify-between">
                    {/* WORD FOUND */}
                    <div className="flex flex-col items-cnter px-4 py-2 rounded-full">
                      <span className='text-xs text-gray-400'>Word Count</span>
                      <span className="text-sm font-bold text-blue-400">{wordsFound.length}</span>
                    </div>

                    {/* POINTS EARNED */}
                    <div className="flex flex-col items-cnter px-4 py-2 rounded-full">
                      <span className='text-xs text-gray-400'>Points Earned</span>
                      <span
                        className={`text-sm font-bold transition-all duration-300 ${isAnimating
                            ? 'text-yellow-400 scale-110 drop-shadow-lg'
                            : 'text-green-400 scale-100'
                          }`}
                        style={{
                          textShadow: isAnimating ? '0 0 10px rgba(250, 204, 21, 0.5)' : 'none'
                        }}
                      >
                        {displayScore.toLocaleString()}
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
                  className={`p-1 inline-block rounded-lg z-10 border ${isCurrentWordValid()
                    ? 'bg-green-900/30 border-green-600 text-green-400'
                    : 'bg-red-900/50 border-red-600 text-red-400'
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

              {/* Current Word */}
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
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
                      disabled={currentWord.length < 2 || isDuplicateWord()}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${currentWord.length >= 2 && !isDuplicateWord()
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

              {/* Available Letters */}
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
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


              {/* {wordsFound.length > 0 && (
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
            )} */}
            </div>
          </>
        )}

        {/* Game Results */}
        {gameEnded && validationResults && (
          <PostGame clearCurrentGameState={clearCurrentGameState} currentUser={currentUser} validationResults={validationResults} startGame={startGame} />
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

                {/* Cancel Game Button - Enhanced */}
                <AnimatePresence>
                  {gameStarted && !gameEnded && (
                    <motion.button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel the current game?')) {
                          cancelGame()
                        }
                      }}
                      className="group relative overflow-hidden bg-gradient-to-r from-red-500/20 to-pink-600/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-red-500/10"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: 30, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {/* Animated background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                      <div className="relative flex items-center">
                        <motion.div
                          animate={{ rotate: [0, 90, 180, 270, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                        </motion.div>
                        <span className="text-sm">Cancle</span>
                      </div>

                      {/* Warning pulse effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-1 border-red-500/50"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Floating particles effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
                    style={{
                      left: `${20 + i * 10}%`,
                      bottom: '20px'
                    }}
                    animate={{
                      y: [-20, -40, -20],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordStakeGame;