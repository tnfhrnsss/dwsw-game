'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAssetPath } from '../lib/basePath';

// 게임 상태 타입
type GameState = 'selectPlayer' | 'listening' | 'playing' | 'success' | 'failed';

// 플레이어 인터페이스
interface Player {
  id: number;
  name: string;
  image: string;
  bgColor: string;
}

// 단어 인터페이스
interface Word {
  word: string;
  emoji: string;
  koreanName: string;
  level: number;
}

// 풍선 인터페이스
interface Balloon {
  id: number;
  word: Word;
  left: number; // 0-100% 위치
  delay: number; // 시작 딜레이 (ms)
  duration: number; // 올라가는 속도 (ms)
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
  { word: 'leaf', emoji: '🍃', koreanName: '잎', level: 4 },
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
  const [correctWord, setCorrectWord] = useState<Word | null>(null);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [streak, setStreak] = useState(0); // 연속 정답 카운터
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const cheerSoundRef = useRef<HTMLAudioElement | null>(null);

  const players: Player[] = [
    {
      id: 1,
      name: '도원',
      image: getAssetPath('/players/dowon.jpeg'),
      bgColor: 'bg-pink-400',
    },
    {
      id: 2,
      name: '승우',
      image: getAssetPath('/players/seungwoo.jpeg'),
      bgColor: 'bg-blue-400',
    }
  ];

  // 연속 정답에 따른 단어 레벨 결정
  const getWordLevel = (streak: number): number => {
    if (streak < 3) return Math.floor(Math.random() * 2) + 1; // 레벨 1-2
    if (streak < 6) return Math.floor(Math.random() * 2) + 3; // 레벨 3-4
    return Math.floor(Math.random() * 2) + 5; // 레벨 5-6
  };

  // 레벨에 맞는 랜덤 단어 선택
  const selectWord = (maxLevel: number): Word => {
    const availableWords = allWords.filter(w => w.level <= maxLevel);
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  // 문제 생성
  const createQuestion = () => {
    const wordLevel = getWordLevel(streak);
    const correct = selectWord(wordLevel);
    setCorrectWord(correct);

    // 오답 단어들 선택 (8-10개 풍선)
    const balloonCount = 8 + Math.floor(Math.random() * 3); // 8-10개
    const wrongWords = allWords
      .filter(w => w.word !== correct.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, balloonCount - 1);

    // 정답과 오답을 섞어서 풍선 생성
    const allBalloonWords = [correct, ...wrongWords].sort(() => Math.random() - 0.5);

    const newBalloons: Balloon[] = allBalloonWords.map((word, idx) => ({
      id: idx,
      word,
      left: 5 + (idx * 10) + Math.random() * 5, // 각 풍선마다 10% 간격 + 약간의 랜덤
      delay: idx * 300 + Math.random() * 500, // 0.3초씩 시차 + 랜덤
      duration: 8000 + Math.random() * 5000, // 8-13초 동안 올라감
    }));

    setBalloons(newBalloons);
    return correct;
  };

  // Web Speech API로 음성 재생
  const speak = (word: Word) => {
    if ('speechSynthesis' in window) {
      setIsAudioPlaying(true);
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsAudioPlaying(false);
        setGameState('playing');
      };

      utterance.onerror = () => {
        setIsAudioPlaying(false);
        setGameState('playing');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setGameState('playing');
    }
  };

  // 플레이어 선택
  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setStreak(0);
    const word = createQuestion();
    setGameState('listening');
    setTimeout(() => {
      speak(word);
    }, 500);
  };

  // 풍선 클릭
  const handleBalloonClick = (balloon: Balloon) => {
    if (gameState !== 'playing' || !correctWord) return;

    if (balloon.word.word === correctWord.word) {
      // 정답!
      setGameState('success');
      setStreak(streak + 1);
      if (cheerSoundRef.current) {
        cheerSoundRef.current.play().catch(e => console.log('Cheer sound failed:', e));
      }
    } else {
      // 오답
      setGameState('failed');
      setStreak(0);
    }
  };

  // 다음 문제
  const handleNextQuestion = () => {
    const word = createQuestion();
    setGameState('listening');
    setTimeout(() => {
      speak(word);
    }, 500);
  };

  // 다시하기 (같은 문제)
  const handleRetry = () => {
    setGameState('listening');
    if (correctWord) {
      setTimeout(() => {
        speak(correctWord);
      }, 500);
    }
  };

  // 다시 듣기
  const handleRelisten = () => {
    if (correctWord) {
      speak(correctWord);
    }
  };

  // 오디오 초기화
  useEffect(() => {
    bgmRef.current = new Audio(getAssetPath('/sounds/bgm.mp3'));
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.3;

    cheerSoundRef.current = new Audio(getAssetPath('/sounds/cheer.mp3'));
    cheerSoundRef.current.volume = 0.5;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    };
  }, []);

  // BGM 재생/정지
  useEffect(() => {
    if (bgmRef.current) {
      if (gameState === 'playing' && !isMuted) {
        bgmRef.current.play().catch((e) => console.log('BGM play failed:', e));
      } else {
        bgmRef.current.pause();
      }
    }
  }, [gameState, isMuted]);

  // 풍선이 화면 끝까지 올라가면 실패
  useEffect(() => {
    if (gameState === 'playing' && balloons.length > 0) {
      const maxDuration = Math.max(...balloons.map(b => b.duration + b.delay));
      const timer = setTimeout(() => {
        setGameState('failed');
        setStreak(0);
      }, maxDuration);

      return () => clearTimeout(timer);
    }
  }, [gameState, balloons]);

  // 플레이어 선택 화면
  if (gameState === 'selectPlayer') {
    return (
      <div className="w-full min-h-screen overflow-y-auto bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300">
        <div className="flex flex-col items-center py-8 md:py-16 px-4 md:px-8">
          <div className="text-center space-y-4 md:space-y-8 mb-8 md:mb-16">
            <h1 className="dongle-font text-6xl md:text-9xl font-bold text-white drop-shadow-2xl animate-bounce">
              풍선 영어 게임 🎈
            </h1>
            <p className="text-3xl md:text-5xl text-white font-bold drop-shadow-lg">
              누가 할까요?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-4xl mb-6 md:mb-8 pb-8">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handlePlayerSelect(player)}
                className={`${player.bgColor} rounded-3xl p-6 md:p-12 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all`}
              >
                <div className="mb-3 md:mb-6 flex justify-center">
                  <Image
                    src={player.image}
                    alt={player.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover md:w-[200px] md:h-[200px]"
                  />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg dongle-font">
                  {player.name}
                </h2>
              </button>
            ))}
          </div>

          <button
            onClick={onBack}
            className="mt-4 md:mt-8 py-4 md:py-6 px-8 md:px-12 bg-gray-600 text-white text-2xl md:text-3xl font-bold rounded-2xl hover:bg-gray-700 transition-all"
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
      <div className="w-full min-h-screen overflow-y-auto bg-gradient-to-br from-indigo-300 via-blue-300 to-cyan-300">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
          <div className="text-center space-y-6 md:space-y-12">
            <div className="text-7xl md:text-9xl animate-pulse">🔊</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
              Listen carefully!
            </h1>
            <p className="text-2xl md:text-4xl text-white drop-shadow-lg">
              잘 듣고 기억하세요!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 게임 플레이 화면
  return (
    <div className="w-full min-h-screen overflow-hidden bg-gradient-to-br from-sky-200 via-blue-200 to-indigo-200 relative">
      {/* 상단바 */}
      <div className="bg-white rounded-2xl shadow-lg p-2 md:p-4 m-2 md:m-4 flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 md:gap-4">
          {selectedPlayer && (
            <>
              <Image
                src={selectedPlayer.image}
                alt={selectedPlayer.name}
                width={40}
                height={40}
                className="rounded-full object-cover md:w-[50px] md:h-[50px]"
              />
              <span className="text-lg md:text-2xl font-bold text-black">{selectedPlayer.name}</span>
            </>
          )}
        </div>

        <div className="text-lg md:text-2xl font-bold text-blue-700">
          연속 {streak}개 맞춤! 🔥
        </div>

        {/* 속도 조절 버튼 */}
        <div className="flex gap-1 md:gap-2 items-center">
          <button
            onClick={() => setSpeechRate(0.3)}
            className={`px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-lg font-bold transition-all ${
              speechRate === 0.3
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            느리게
          </button>
          <button
            onClick={() => setSpeechRate(0.5)}
            className={`px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-lg font-bold transition-all ${
              speechRate === 0.5
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            정상
          </button>
          <button
            onClick={() => setSpeechRate(0.7)}
            className={`px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-lg font-bold transition-all ${
              speechRate === 0.7
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            빠르게
          </button>
        </div>

        <button
          onClick={handleRelisten}
          disabled={isAudioPlaying}
          className={`px-3 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-xl font-bold ${
            !isAudioPlaying
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          🔊 다시듣기
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="px-3 md:px-6 py-2 md:py-3 bg-purple-500 text-white text-sm md:text-xl font-bold rounded-xl hover:bg-purple-600"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          onClick={onBack}
          className="px-4 md:px-8 py-2 md:py-3 bg-gray-600 text-white text-lg md:text-2xl font-bold rounded-xl hover:bg-gray-700"
        >
          그만하기
        </button>
      </div>

      {/* 풍선들 */}
      {balloons.map((balloon) => (
        <button
          key={balloon.id}
          onClick={() => handleBalloonClick(balloon)}
          disabled={gameState !== 'playing'}
          className="balloon absolute cursor-pointer transform hover:scale-110 transition-transform"
          style={{
            left: `${balloon.left}%`,
            animationDelay: `${balloon.delay}ms`,
            animationDuration: `${balloon.duration}ms`,
          }}
        >
          <div className="relative">
            {/* 풍선 모양 */}
            <div className="w-20 h-24 md:w-32 md:h-40 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full relative shadow-2xl">
              {/* 이모지 */}
              <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl">
                {balloon.word.emoji}
              </div>
              {/* 한글 이름 */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg whitespace-nowrap z-10">
                <span className="text-xs md:text-lg font-bold text-gray-800">
                  {balloon.word.koreanName}
                </span>
              </div>
            </div>
            {/* 풍선 줄 */}
            <div className="absolute left-1/2 top-full w-0.5 h-8 md:h-12 bg-gray-400 transform -translate-x-1/2"></div>
          </div>
        </button>
      ))}

      {/* 성공 오버레이 */}
      {gameState === 'success' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-celebrate">
            <div className="text-6xl md:text-8xl mb-4">🎉</div>
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
              정답입니다!
            </h2>
            <p className="text-2xl md:text-3xl text-gray-700 mb-6">
              연속 {streak}개 맞춤!
            </p>
            <button
              onClick={handleNextQuestion}
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl md:text-3xl font-bold rounded-2xl hover:shadow-2xl transition-all"
            >
              다음 문제 →
            </button>
          </div>
        </div>
      )}

      {/* 실패 오버레이 */}
      {gameState === 'failed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-shake">
            <div className="text-6xl md:text-8xl mb-4">😅</div>
            <h2 className="text-4xl md:text-5xl font-bold text-orange-600 mb-6">
              아쉬워요!
            </h2>
            <button
              onClick={handleRetry}
              className="px-8 py-4 bg-orange-500 text-white text-2xl md:text-3xl font-bold rounded-2xl hover:bg-orange-600 transition-all"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
