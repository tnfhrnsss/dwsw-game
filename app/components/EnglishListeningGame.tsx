'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAssetPath } from '../lib/basePath';

// 게임 상태 타입
type GameState = 'selectPlayer' | 'listening' | 'finding' | 'checking' | 'success' | 'failed' | 'levelComplete';

// 플레이어 인터페이스
interface Player {
  id: number;
  name: string;
  image: string;
  bgColor: string;
  progress: {
    currentLevel: number;
    maxLevel: number;
    totalGamesPlayed: number;
    correctAnswers: number;
  };
}

// 단어 인터페이스
interface Word {
  word: string;
  emoji: string;
  koreanName: string;
  level: number;
}

// 문제 인터페이스
interface Question {
  level: number;
  correctWords: Word[];
  options: Word[];
  selectedWords: Word[];
}

// 컴포넌트 Props
interface EnglishListeningGameProps {
  onBack: () => void;
}

// 단어 데이터베이스
const animals: Word[] = [
  { word: 'dog', emoji: '🐕', koreanName: '강아지', level: 1 },
  { word: 'cat', emoji: '🐱', koreanName: '고양이', level: 1 },
  { word: 'rabbit', emoji: '🐰', koreanName: '토끼', level: 2 },
  { word: 'bear', emoji: '🐻', koreanName: '곰', level: 2 },
  { word: 'fox', emoji: '🦊', koreanName: '여우', level: 3 },
  { word: 'lion', emoji: '🦁', koreanName: '사자', level: 2 },
  { word: 'tiger', emoji: '🐯', koreanName: '호랑이', level: 3 },
  { word: 'elephant', emoji: '🐘', koreanName: '코끼리', level: 4 },
  { word: 'giraffe', emoji: '🦒', koreanName: '기린', level: 5 },
  { word: 'zebra', emoji: '🦓', koreanName: '얼룩말', level: 5 },
  { word: 'panda', emoji: '🐼', koreanName: '판다', level: 3 },
  { word: 'pig', emoji: '🐷', koreanName: '돼지', level: 2 },
  { word: 'cow', emoji: '🐮', koreanName: '소', level: 2 },
  { word: 'horse', emoji: '🐴', koreanName: '말', level: 3 },
  { word: 'sheep', emoji: '🐑', koreanName: '양', level: 3 },
  { word: 'monkey', emoji: '🐵', koreanName: '원숭이', level: 3 },
  { word: 'chicken', emoji: '🐔', koreanName: '닭', level: 2 },
  { word: 'duck', emoji: '🦆', koreanName: '오리', level: 2 },
  { word: 'penguin', emoji: '🐧', koreanName: '펭귄', level: 4 },
  { word: 'fish', emoji: '🐟', koreanName: '물고기', level: 1 },
  { word: 'turtle', emoji: '🐢', koreanName: '거북이', level: 3 },
  { word: 'frog', emoji: '🐸', koreanName: '개구리', level: 3 },
  { word: 'bird', emoji: '🐦', koreanName: '새', level: 1 },
  { word: 'butterfly', emoji: '🦋', koreanName: '나비', level: 5 },
  { word: 'bee', emoji: '🐝', koreanName: '벌', level: 2 }
];

const fruits: Word[] = [
  { word: 'apple', emoji: '🍎', koreanName: '사과', level: 1 },
  { word: 'banana', emoji: '🍌', koreanName: '바나나', level: 1 },
  { word: 'grape', emoji: '🍇', koreanName: '포도', level: 2 },
  { word: 'strawberry', emoji: '🍓', koreanName: '딸기', level: 3 },
  { word: 'watermelon', emoji: '🍉', koreanName: '수박', level: 4 },
  { word: 'orange', emoji: '🍊', koreanName: '오렌지', level: 2 },
  { word: 'peach', emoji: '🍑', koreanName: '복숭아', level: 3 },
  { word: 'pear', emoji: '🍐', koreanName: '배', level: 2 },
  { word: 'cherry', emoji: '🍒', koreanName: '체리', level: 3 },
  { word: 'pineapple', emoji: '🍍', koreanName: '파인애플', level: 5 },
  { word: 'kiwi', emoji: '🥝', koreanName: '키위', level: 3 },
  { word: 'mango', emoji: '🥭', koreanName: '망고', level: 4 },
  { word: 'lemon', emoji: '🍋', koreanName: '레몬', level: 3 },
  { word: 'coconut', emoji: '🥥', koreanName: '코코넛', level: 5 },
  { word: 'avocado', emoji: '🥑', koreanName: '아보카도', level: 6 },
  { word: 'tomato', emoji: '🍅', koreanName: '토마토', level: 3 },
  { word: 'melon', emoji: '🍈', koreanName: '멜론', level: 3 },
  { word: 'blueberry', emoji: '🫐', koreanName: '블루베리', level: 5 },
  { word: 'tangerine', emoji: '🍊', koreanName: '귤', level: 4 },
  { word: 'plum', emoji: '🍑', koreanName: '자두', level: 3 }
];

const colors: Word[] = [
  { word: 'red', emoji: '🔴', koreanName: '빨강', level: 1 },
  { word: 'blue', emoji: '🔵', koreanName: '파랑', level: 1 },
  { word: 'yellow', emoji: '🟡', koreanName: '노랑', level: 1 },
  { word: 'green', emoji: '🟢', koreanName: '초록', level: 2 },
  { word: 'orange', emoji: '🟠', koreanName: '주황', level: 2 },
  { word: 'purple', emoji: '🟣', koreanName: '보라', level: 3 },
  { word: 'pink', emoji: '🩷', koreanName: '분홍', level: 2 },
  { word: 'brown', emoji: '🟤', koreanName: '갈색', level: 3 },
  { word: 'black', emoji: '⚫', koreanName: '검정', level: 2 },
  { word: 'white', emoji: '⚪', koreanName: '하양', level: 2 },
  { word: 'gray', emoji: '🩶', koreanName: '회색', level: 3 },
  { word: 'gold', emoji: '🟡', koreanName: '금색', level: 4 }
];

const numbers: Word[] = [
  { word: 'one', emoji: '1️⃣', koreanName: '일', level: 1 },
  { word: 'two', emoji: '2️⃣', koreanName: '이', level: 1 },
  { word: 'three', emoji: '3️⃣', koreanName: '삼', level: 2 },
  { word: 'four', emoji: '4️⃣', koreanName: '사', level: 2 },
  { word: 'five', emoji: '5️⃣', koreanName: '오', level: 2 },
  { word: 'six', emoji: '6️⃣', koreanName: '육', level: 3 },
  { word: 'seven', emoji: '7️⃣', koreanName: '칠', level: 3 },
  { word: 'eight', emoji: '8️⃣', koreanName: '팔', level: 3 },
  { word: 'nine', emoji: '9️⃣', koreanName: '구', level: 3 },
  { word: 'ten', emoji: '🔟', koreanName: '십', level: 3 }
];

const nature: Word[] = [
  { word: 'sun', emoji: '☀️', koreanName: '해', level: 1 },
  { word: 'moon', emoji: '🌙', koreanName: '달', level: 1 },
  { word: 'star', emoji: '⭐', koreanName: '별', level: 1 },
  { word: 'cloud', emoji: '☁️', koreanName: '구름', level: 2 },
  { word: 'rain', emoji: '🌧️', koreanName: '비', level: 2 },
  { word: 'snow', emoji: '❄️', koreanName: '눈', level: 2 },
  { word: 'rainbow', emoji: '🌈', koreanName: '무지개', level: 4 },
  { word: 'flower', emoji: '🌸', koreanName: '꽃', level: 2 },
  { word: 'tree', emoji: '🌳', koreanName: '나무', level: 1 },
  { word: 'leaf', emoji: '🍃', koreanName: '잎', level: 2 },
  { word: 'mountain', emoji: '⛰️', koreanName: '산', level: 3 },
  { word: 'ocean', emoji: '🌊', koreanName: '바다', level: 3 },
  { word: 'fire', emoji: '🔥', koreanName: '불', level: 2 },
  { word: 'water', emoji: '💧', koreanName: '물', level: 2 },
  { word: 'wind', emoji: '💨', koreanName: '바람', level: 3 }
];

const vehicles: Word[] = [
  { word: 'car', emoji: '🚗', koreanName: '자동차', level: 1 },
  { word: 'bus', emoji: '🚌', koreanName: '버스', level: 2 },
  { word: 'train', emoji: '🚂', koreanName: '기차', level: 2 },
  { word: 'airplane', emoji: '✈️', koreanName: '비행기', level: 3 },
  { word: 'helicopter', emoji: '🚁', koreanName: '헬리콥터', level: 6 },
  { word: 'boat', emoji: '⛵', koreanName: '배', level: 2 },
  { word: 'bicycle', emoji: '🚲', koreanName: '자전거', level: 4 },
  { word: 'rocket', emoji: '🚀', koreanName: '로켓', level: 3 },
  { word: 'taxi', emoji: '🚕', koreanName: '택시', level: 3 },
  { word: 'ambulance', emoji: '🚑', koreanName: '구급차', level: 5 }
];

const food: Word[] = [
  { word: 'pizza', emoji: '🍕', koreanName: '피자', level: 2 },
  { word: 'hamburger', emoji: '🍔', koreanName: '햄버거', level: 4 },
  { word: 'bread', emoji: '🍞', koreanName: '빵', level: 2 },
  { word: 'cake', emoji: '🍰', koreanName: '케이크', level: 2 },
  { word: 'cookie', emoji: '🍪', koreanName: '쿠키', level: 3 },
  { word: 'candy', emoji: '🍬', koreanName: '사탕', level: 3 },
  { word: 'ice cream', emoji: '🍦', koreanName: '아이스크림', level: 3 },
  { word: 'donut', emoji: '🍩', koreanName: '도넛', level: 3 },
  { word: 'milk', emoji: '🥛', koreanName: '우유', level: 2 },
  { word: 'juice', emoji: '🧃', koreanName: '주스', level: 2 },
  { word: 'egg', emoji: '🥚', koreanName: '계란', level: 1 },
  { word: 'cheese', emoji: '🧀', koreanName: '치즈', level: 3 }
];

// 모든 단어 배열
const allWords = [...animals, ...fruits, ...colors, ...numbers, ...nature, ...vehicles, ...food];

export default function EnglishListeningGame({ onBack }: EnglishListeningGameProps) {
  const [gameState, setGameState] = useState<GameState>('selectPlayer');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [remainingListens, setRemainingListens] = useState(3);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const cheerSoundRef = useRef<HTMLAudioElement | null>(null);

  const players: Player[] = [
    {
      id: 1,
      name: '도원',
      image: getAssetPath('/players/dowon.jpeg'),
      bgColor: 'bg-pink-400',
      progress: {
        currentLevel: 1,
        maxLevel: 1,
        totalGamesPlayed: 0,
        correctAnswers: 0
      }
    },
    {
      id: 2,
      name: '승우',
      image: getAssetPath('/players/seungwoo.jpeg'),
      bgColor: 'bg-blue-400',
      progress: {
        currentLevel: 1,
        maxLevel: 1,
        totalGamesPlayed: 0,
        correctAnswers: 0
      }
    }
  ];

  // 레벨에 따른 단어 개수 결정
  // 같은 단어 개수로 10번 성공해야 다음 단계로
  const getWordCount = (level: number): number => {
    if (level <= 10) return 2;  // 레벨 1-10: 2개 단어
    if (level <= 20) return 3;  // 레벨 11-20: 3개 단어
    if (level <= 30) return 4;  // 레벨 21-30: 4개 단어
    if (level <= 40) return 5;  // 레벨 31-40: 5개 단어
    return 6;                   // 레벨 41+: 6개 단어
  };

  // 레벨에 맞는 랜덤 단어 선택
  const selectWords = (count: number, gameLevel: number): Word[] => {
    // 레벨별 최대 단어 난이도 결정
    let maxWordLevel = 2; // 기본값
    if (gameLevel <= 10) maxWordLevel = 2;      // 레벨 1-10: 난이도 1-2 단어
    else if (gameLevel <= 20) maxWordLevel = 3; // 레벨 11-20: 난이도 1-3 단어
    else if (gameLevel <= 30) maxWordLevel = 4; // 레벨 21-30: 난이도 1-4 단어
    else if (gameLevel <= 40) maxWordLevel = 5; // 레벨 31-40: 난이도 1-5 단어
    else maxWordLevel = 6;                      // 레벨 41+: 난이도 1-6 단어

    // 현재 레벨에 맞는 단어만 필터링
    const availableWords = allWords.filter(w => w.level <= maxWordLevel);

    // 랜덤 섞기
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // 오답 선택지 생성
  const generateOptions = (correctWords: Word[], totalOptions: number): Word[] => {
    const wrongWords = allWords.filter(
      w => !correctWords.find(c => c.word === w.word)
    );
    const shuffledWrong = wrongWords.sort(() => Math.random() - 0.5);
    const wrongCount = totalOptions - correctWords.length;

    return [...correctWords, ...shuffledWrong.slice(0, wrongCount)]
      .sort(() => Math.random() - 0.5);
  };

  // 문제 생성
  const createQuestion = (level: number): Question => {
    const wordCount = getWordCount(level);
    const screenItemCount = wordCount <= 3 ? 8 : 12;

    const correctWords = selectWords(wordCount, level); // level 파라미터 추가
    const allOptions = generateOptions(correctWords, screenItemCount);

    return {
      level,
      correctWords,
      options: allOptions,
      selectedWords: []
    };
  };

  // Web Speech API로 음성 재생
  const speak = (words: Word[]) => {
    if ('speechSynthesis' in window) {
      setIsAudioPlaying(true);

      // 기존 음성 정지
      window.speechSynthesis.cancel();

      const text = words.map(w => w.word).join(', ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.2; // 음성 속도 (0.1 ~ 10, 기본값 1) - 매우 천천히
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      let transitioned = false;

      const transitionToFinding = () => {
        if (!transitioned) {
          transitioned = true;
          setIsAudioPlaying(false);
          setGameState('finding');
        }
      };

      utterance.onend = transitionToFinding;
      utterance.onerror = transitionToFinding;

      window.speechSynthesis.speak(utterance);

      // 안전장치: 음성 길이 추정 (rate 0.2이므로 단어당 7초 + 쉼표 2초)
      const estimatedDuration = words.length * 7000 + (words.length - 1) * 2000 + 1000;
      setTimeout(transitionToFinding, estimatedDuration);
    } else {
      // Web Speech API 미지원 시 바로 찾기 단계로
      setIsAudioPlaying(false);
      setGameState('finding');
    }
  };

  // 플레이어 선택
  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    const newQuestion = createQuestion(1);
    setQuestion(newQuestion);
    setGameState('listening');
    setTimeout(() => {
      speak(newQuestion.correctWords);
    }, 500);
  };

  // 터치 소리 재생 함수
  const playTapSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 주파수
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log('Audio playback failed:', e);
    }
  };

  // 단어 선택/해제
  const handleWordClick = (word: Word) => {
    if (gameState !== 'finding' || !question) return;

    // 터치 소리 재생
    playTapSound();

    const isSelected = question.selectedWords.find(w => w.word === word.word);

    if (isSelected) {
      // 선택 해제
      setQuestion({
        ...question,
        selectedWords: question.selectedWords.filter(w => w.word !== word.word)
      });
    } else {
      // 선택
      setQuestion({
        ...question,
        selectedWords: [...question.selectedWords, word]
      });
    }
  };

  // 정답 확인
  const checkAnswer = () => {
    if (!question) return;

    const correctWordSet = new Set(question.correctWords.map(w => w.word));
    const selectedWordSet = new Set(question.selectedWords.map(w => w.word));

    // 개수가 다르면 오답
    if (question.selectedWords.length !== question.correctWords.length) {
      setGameState('failed');
      return;
    }

    // 모든 정답 단어가 선택되었는지 확인
    for (let word of correctWordSet) {
      if (!selectedWordSet.has(word)) {
        setGameState('failed');
        return;
      }
    }

    // 정답!
    setGameState('success');

    // 환호 사운드 재생
    if (cheerSoundRef.current) {
      cheerSoundRef.current.play().catch(e => console.log('Cheer sound play failed:', e));
    }
  };

  // 다시 듣기
  const handleRelisten = () => {
    if (remainingListens > 0 && question) {
      setRemainingListens(remainingListens - 1);
      setGameState('listening');
      speak(question.correctWords);
    }
  };

  // 다음 레벨
  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    const newQuestion = createQuestion(nextLevel);
    setQuestion(newQuestion);
    setRemainingListens(3);
    setGameState('listening');
    setTimeout(() => {
      speak(newQuestion.correctWords);
    }, 500);
  };

  // 다시하기
  const handleRetry = () => {
    if (question) {
      setQuestion({
        ...question,
        selectedWords: []
      });
      setGameState('finding');
    }
  };

  // 모르겠습니다 - 힌트 보기
  const handleShowHint = () => {
    if (!question) return;

    // 토스트 메시지 표시
    setShowToast(true);

    // 음성 다시 재생
    speak(question.correctWords);

    // 2초 후 토스트 숨김
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 오디오 초기화
  useEffect(() => {
    cheerSoundRef.current = new Audio(getAssetPath('/sounds/cheer.mp3'));

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 플레이어 선택 화면
  if (gameState === 'selectPlayer') {
    return (
      <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center space-y-8 mb-16">
            <h1 className="dongle-font text-9xl font-bold text-white drop-shadow-2xl animate-bounce">
              영어 듣기 게임 🎧
            </h1>
            <p className="text-5xl text-white font-bold drop-shadow-lg">
              누가 할까요?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-8">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handlePlayerSelect(player)}
                className={`${player.bgColor} rounded-3xl p-12 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all`}
              >
                <div className="mb-6 flex justify-center">
                  <Image
                    src={player.image}
                    alt={player.name}
                    width={200}
                    height={200}
                    className="rounded-full object-cover"
                  />
                </div>
                <h2 className="text-6xl font-bold text-white drop-shadow-lg dongle-font">
                  {player.name}
                </h2>
              </button>
            ))}
          </div>

          <button
            onClick={onBack}
            className="mt-8 py-6 px-12 bg-gray-600 text-white text-3xl font-bold rounded-2xl hover:bg-gray-700 transition-all"
          >
            ← 뒤로가기
          </button>
        </div>
      </div>
    );
  }

  // 듣기 단계
  if (gameState === 'listening') {
    return (
      <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-indigo-300 via-blue-300 to-cyan-300">
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center space-y-12">
            <div className="text-9xl animate-pulse">🔊</div>
            <h1 className="text-7xl font-bold text-white drop-shadow-2xl">
              Listen carefully!
            </h1>
            <p className="text-4xl text-white drop-shadow-lg">
              잘 듣고 기억하세요!
            </p>
            <div className="flex gap-4 justify-center mt-8">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`text-6xl ${i < remainingListens ? 'opacity-100' : 'opacity-30'}`}
                >
                  ❤️
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 찾기/확인/성공/실패 단계
  if (question && (gameState === 'finding' || gameState === 'checking' || gameState === 'success' || gameState === 'failed')) {
    return (
      <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 p-4">
        {/* 상단바 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedPlayer && (
              <Image
                src={selectedPlayer.image}
                alt={selectedPlayer.name}
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
            )}
            <span className="text-2xl font-bold text-black">{selectedPlayer?.name}</span>
          </div>
          <div className="text-2xl font-bold text-black">Level {currentLevel}</div>
          <button
            onClick={handleRelisten}
            disabled={remainingListens === 0 || isAudioPlaying}
            className={`px-6 py-3 rounded-xl text-xl font-bold ${
              remainingListens > 0 && !isAudioPlaying
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🔊 다시듣기
          </button>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-3xl ${i < remainingListens ? 'opacity-100' : 'opacity-30'}`}>
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* 그림 그리드 */}
        <div className={`grid ${question.options.length <= 8 ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-6'} gap-6 mb-4`}>
          {question.options.map((word, idx) => {
            const isSelected = question.selectedWords.find(w => w.word === word.word);
            const isCorrect = gameState === 'success' && question.correctWords.find(w => w.word === word.word);
            const isWrong = gameState === 'failed' && isSelected && !question.correctWords.find(w => w.word === word.word);

            return (
              <button
                key={idx}
                onClick={() => handleWordClick(word)}
                disabled={gameState === 'success' || gameState === 'failed'}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center
                  transition-all transform hover:scale-105
                  ${isSelected ? 'bg-green-300 border-4 border-green-600 scale-110 shadow-xl' : 'bg-white border-4 border-gray-300'}
                  ${isCorrect ? 'bg-green-400 border-green-700 animate-bounce' : ''}
                  ${isWrong ? 'bg-red-400 border-red-700' : ''}
                `}
              >
                <div className="text-8xl">{word.emoji}</div>
                <div className="text-2xl font-bold text-gray-700 mt-2">{word.koreanName}</div>
              </button>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 justify-center">
          {gameState === 'finding' && (
            <>
              <button
                onClick={checkAnswer}
                disabled={question.selectedWords.length !== question.correctWords.length}
                className={`px-12 py-6 rounded-2xl text-3xl font-bold ${
                  question.selectedWords.length === question.correctWords.length
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                확인하기
              </button>

              <button
                onClick={handleShowHint}
                className="px-12 py-6 bg-yellow-500 text-white text-3xl font-bold rounded-2xl hover:bg-yellow-600"
              >
                모르겠습니다
              </button>
            </>
          )}

          {gameState === 'success' && (
            <>
              <div className="text-6xl animate-bounce">🎉</div>
              <button
                onClick={handleNextLevel}
                className="px-12 py-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-3xl font-bold rounded-2xl shadow-xl hover:shadow-2xl"
              >
                다음 레벨 →
              </button>
            </>
          )}

          {gameState === 'failed' && (
            <>
              <div className="text-6xl">😢</div>
              <button
                onClick={handleRetry}
                className="px-12 py-6 bg-orange-500 text-white text-3xl font-bold rounded-2xl hover:bg-orange-600"
              >
                다시하기
              </button>
            </>
          )}

          <button
            onClick={onBack}
            className="px-8 py-6 bg-gray-600 text-white text-2xl font-bold rounded-2xl hover:bg-gray-700"
          >
            그만하기
          </button>
        </div>

        {/* 토스트 메시지 - 정답 힌트 */}
        {showToast && question && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white px-12 py-8 rounded-3xl shadow-2xl z-50 animate-pulse">
            <div className="text-4xl font-bold mb-4 text-center">정답은:</div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
              {question.correctWords.map((word, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-7xl mb-2">{word.emoji}</div>
                  <div className="text-3xl font-bold">{word.koreanName}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
