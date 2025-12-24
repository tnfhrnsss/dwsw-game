'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAssetPath } from '../lib/basePath';
import '../hangul-game.css';

// 200개 단어 데이터베이스
const wordDatabase = [
  // 동물 (40개)
  { word: '강아지', emoji: '🐕', category: '동물' },
  { word: '고양이', emoji: '🐱', category: '동물' },
  { word: '토끼', emoji: '🐰', category: '동물' },
  { word: '곰', emoji: '🐻', category: '동물' },
  { word: '여우', emoji: '🦊', category: '동물' },
  { word: '사자', emoji: '🦁', category: '동물' },
  { word: '호랑이', emoji: '🐯', category: '동물' },
  { word: '코끼리', emoji: '🐘', category: '동물' },
  { word: '기린', emoji: '🦒', category: '동물' },
  { word: '얼룩말', emoji: '🦓', category: '동물' },
  { word: '판다', emoji: '🐼', category: '동물' },
  { word: '돼지', emoji: '🐷', category: '동물' },
  { word: '소', emoji: '🐮', category: '동물' },
  { word: '말', emoji: '🐴', category: '동물' },
  { word: '양', emoji: '🐑', category: '동물' },
  { word: '원숭이', emoji: '🐵', category: '동물' },
  { word: '닭', emoji: '🐔', category: '동물' },
  { word: '오리', emoji: '🦆', category: '동물' },
  { word: '펭귄', emoji: '🐧', category: '동물' },
  { word: '물고기', emoji: '🐟', category: '동물' },
  { word: '고래', emoji: '🐋', category: '동물' },
  { word: '상어', emoji: '🦈', category: '동물' },
  { word: '문어', emoji: '🐙', category: '동물' },
  { word: '게', emoji: '🦀', category: '동물' },
  { word: '새우', emoji: '🦐', category: '동물' },
  { word: '거북이', emoji: '🐢', category: '동물' },
  { word: '뱀', emoji: '🐍', category: '동물' },
  { word: '악어', emoji: '🐊', category: '동물' },
  { word: '개구리', emoji: '🐸', category: '동물' },
  { word: '다람쥐', emoji: '🐿️', category: '동물' },
  { word: '쥐', emoji: '🐭', category: '동물' },
  { word: '햄스터', emoji: '🐹', category: '동물' },
  { word: '새', emoji: '🐦', category: '동물' },
  { word: '독수리', emoji: '🦅', category: '동물' },
  { word: '올빼미', emoji: '🦉', category: '동물' },
  { word: '공룡', emoji: '🦕', category: '동물' },
  { word: '사슴', emoji: '🦌', category: '동물' },
  { word: '낙타', emoji: '🐪', category: '동물' },
  { word: '캥거루', emoji: '🦘', category: '동물' },
  { word: '코알라', emoji: '🐨', category: '동물' },

  // 곤충 (20개)
  { word: '나비', emoji: '🦋', category: '곤충' },
  { word: '벌', emoji: '🐝', category: '곤충' },
  { word: '개미', emoji: '🐜', category: '곤충' },
  { word: '무당벌레', emoji: '🐞', category: '곤충' },
  { word: '거미', emoji: '🕷️', category: '곤충' },
  { word: '파리', emoji: '🪰', category: '곤충' },
  { word: '모기', emoji: '🦟', category: '곤충' },
  { word: '잠자리', emoji: '🪰', category: '곤충' },
  { word: '메뚜기', emoji: '🦗', category: '곤충' },
  { word: '매미', emoji: '🦗', category: '곤충' },
  { word: '귀뚜라미', emoji: '🦗', category: '곤충' },
  { word: '사마귀', emoji: '🦗', category: '곤충' },
  { word: '달팽이', emoji: '🐌', category: '곤충' },
  { word: '지렁이', emoji: '🪱', category: '곤충' },
  { word: '애벌레', emoji: '🐛', category: '곤충' },
  { word: '전갈', emoji: '🦂', category: '곤충' },
  { word: '벌레', emoji: '🐛', category: '곤충' },
  { word: '딱정벌레', emoji: '🪲', category: '곤충' },
  { word: '풍뎅이', emoji: '🪲', category: '곤충' },
  { word: '장수풍뎅이', emoji: '🪲', category: '곤충' },

  // 과일 (25개)
  { word: '사과', emoji: '🍎', category: '과일' },
  { word: '바나나', emoji: '🍌', category: '과일' },
  { word: '포도', emoji: '🍇', category: '과일' },
  { word: '딸기', emoji: '🍓', category: '과일' },
  { word: '수박', emoji: '🍉', category: '과일' },
  { word: '참외', emoji: '🍈', category: '과일' },
  { word: '복숭아', emoji: '🍑', category: '과일' },
  { word: '배', emoji: '🍐', category: '과일' },
  { word: '감', emoji: '🍊', category: '과일' },
  { word: '귤', emoji: '🍊', category: '과일' },
  { word: '레몬', emoji: '🍋', category: '과일' },
  { word: '오렌지', emoji: '🍊', category: '과일' },
  { word: '체리', emoji: '🍒', category: '과일' },
  { word: '자두', emoji: '🍑', category: '과일' },
  { word: '살구', emoji: '🍑', category: '과일' },
  { word: '키위', emoji: '🥝', category: '과일' },
  { word: '파인애플', emoji: '🍍', category: '과일' },
  { word: '망고', emoji: '🥭', category: '과일' },
  { word: '아보카도', emoji: '🥑', category: '과일' },
  { word: '코코넛', emoji: '🥥', category: '과일' },
  { word: '블루베리', emoji: '🫐', category: '과일' },
  { word: '토마토', emoji: '🍅', category: '과일' },
  { word: '매실', emoji: '🍑', category: '과일' },
  { word: '석류', emoji: '🍎', category: '과일' },

  // 채소 (20개)
  { word: '당근', emoji: '🥕', category: '채소' },
  { word: '감자', emoji: '🥔', category: '채소' },
  { word: '고구마', emoji: '🍠', category: '채소' },
  { word: '양파', emoji: '🧅', category: '채소' },
  { word: '마늘', emoji: '🧄', category: '채소' },
  { word: '배추', emoji: '🥬', category: '채소' },
  { word: '양배추', emoji: '🥬', category: '채소' },
  { word: '브로콜리', emoji: '🥦', category: '채소' },
  { word: '상추', emoji: '🥬', category: '채소' },
  { word: '시금치', emoji: '🥬', category: '채소' },
  { word: '오이', emoji: '🥒', category: '채소' },
  { word: '호박', emoji: '🎃', category: '채소' },
  { word: '가지', emoji: '🍆', category: '채소' },
  { word: '피망', emoji: '🫑', category: '채소' },
  { word: '고추', emoji: '🌶️', category: '채소' },
  { word: '옥수수', emoji: '🌽', category: '채소' },
  { word: '버섯', emoji: '🍄', category: '채소' },
  { word: '콩', emoji: '🫘', category: '채소' },
  { word: '무', emoji: '🥕', category: '채소' },
  { word: '파', emoji: '🧅', category: '채소' },

  // 음식 (25개)
  { word: '밥', emoji: '🍚', category: '음식' },
  { word: '빵', emoji: '🍞', category: '음식' },
  { word: '떡', emoji: '🍡', category: '음식' },
  { word: '김밥', emoji: '🍙', category: '음식' },
  { word: '라면', emoji: '🍜', category: '음식' },
  { word: '국수', emoji: '🍝', category: '음식' },
  { word: '피자', emoji: '🍕', category: '음식' },
  { word: '햄버거', emoji: '🍔', category: '음식' },
  { word: '치킨', emoji: '🍗', category: '음식' },
  { word: '샌드위치', emoji: '🥪', category: '음식' },
  { word: '핫도그', emoji: '🌭', category: '음식' },
  { word: '타코', emoji: '🌮', category: '음식' },
  { word: '스파게티', emoji: '🍝', category: '음식' },
  { word: '카레', emoji: '🍛', category: '음식' },
  { word: '김치', emoji: '🥬', category: '음식' },
  { word: '계란', emoji: '🥚', category: '음식' },
  { word: '우유', emoji: '🥛', category: '음식' },
  { word: '주스', emoji: '🧃', category: '음식' },
  { word: '아이스크림', emoji: '🍦', category: '음식' },
  { word: '케이크', emoji: '🍰', category: '음식' },
  { word: '쿠키', emoji: '🍪', category: '음식' },
  { word: '사탕', emoji: '🍬', category: '음식' },
  { word: '초콜릿', emoji: '🍫', category: '음식' },
  { word: '도넛', emoji: '🍩', category: '음식' },
  { word: '팝콘', emoji: '🍿', category: '음식' },

  // 생활용품 (30개)
  { word: '의자', emoji: '🪑', category: '생활용품' },
  { word: '책상', emoji: '🪑', category: '생활용품' },
  { word: '침대', emoji: '🛏️', category: '생활용품' },
  { word: '소파', emoji: '🛋️', category: '생활용품' },
  { word: '냉장고', emoji: '🧊', category: '생활용품' },
  { word: '세탁기', emoji: '🧺', category: '생활용품' },
  { word: '텔레비전', emoji: '📺', category: '생활용품' },
  { word: '전화기', emoji: '📞', category: '생활용품' },
  { word: '컴퓨터', emoji: '💻', category: '생활용품' },
  { word: '시계', emoji: '⏰', category: '생활용품' },
  { word: '거울', emoji: '🪞', category: '생활용품' },
  { word: '빗', emoji: '🪮', category: '생활용품' },
  { word: '칫솔', emoji: '🪥', category: '생활용품' },
  { word: '수건', emoji: '🧴', category: '생활용품' },
  { word: '비누', emoji: '🧼', category: '생활용품' },
  { word: '휴지', emoji: '🧻', category: '생활용품' },
  { word: '우산', emoji: '☂️', category: '생활용품' },
  { word: '가방', emoji: '🎒', category: '생활용품' },
  { word: '모자', emoji: '🎩', category: '생활용품' },
  { word: '안경', emoji: '👓', category: '생활용품' },
  { word: '신발', emoji: '👟', category: '생활용품' },
  { word: '양말', emoji: '🧦', category: '생활용품' },
  { word: '장갑', emoji: '🧤', category: '생활용품' },
  { word: '책', emoji: '📖', category: '생활용품' },
  { word: '연필', emoji: '✏️', category: '생활용품' },
  { word: '지우개', emoji: '🧽', category: '생활용품' },
  { word: '가위', emoji: '✂️', category: '생활용품' },
  { word: '풀', emoji: '🧴', category: '생활용품' },
  { word: '공', emoji: '⚽', category: '생활용품' },
  { word: '인형', emoji: '🧸', category: '생활용품' },

  // 자연/기타 (20개)
  { word: '해', emoji: '☀️', category: '자연' },
  { word: '달', emoji: '🌙', category: '자연' },
  { word: '별', emoji: '⭐', category: '자연' },
  { word: '구름', emoji: '☁️', category: '자연' },
  { word: '비', emoji: '🌧️', category: '자연' },
  { word: '눈', emoji: '❄️', category: '자연' },
  { word: '바람', emoji: '💨', category: '자연' },
  { word: '번개', emoji: '⚡', category: '자연' },
  { word: '무지개', emoji: '🌈', category: '자연' },
  { word: '꽃', emoji: '🌸', category: '자연' },
  { word: '나무', emoji: '🌳', category: '자연' },
  { word: '풀', emoji: '🌿', category: '자연' },
  { word: '바다', emoji: '🌊', category: '자연' },
  { word: '산', emoji: '⛰️', category: '자연' },
  { word: '강', emoji: '🌊', category: '자연' },
  { word: '불', emoji: '🔥', category: '자연' },
  { word: '물', emoji: '💧', category: '자연' },
  { word: '흙', emoji: '🌍', category: '자연' },
  { word: '돌', emoji: '🪨', category: '자연' },
  { word: '모래', emoji: '🏖️', category: '자연' },
];

// 한글 자모음 분리 함수
const getHangulLetters = (word: string) => {
  return word.split('');
};

// 랜덤 오답 글자 생성 - 정답 글자와 겹치지 않는 오답 글자를 생성
const getRandomWrongLetters = (correctLetters: string[], count = 6) => {
  // 다양한 한글 글자 풀 (6-7살 어린이가 읽기 쉬운 글자들)
  const allLetters = [
    // 기본 자음
    'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
    // 아 행
    '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하',
    // 애 행
    '개', '내', '대', '래', '매', '배', '새', '애', '재', '채', '캐', '태', '패', '해',
    // 오 행
    '고', '노', '도', '로', '모', '보', '소', '오', '조', '초', '코', '토', '포', '호',
    // 우 행
    '구', '누', '두', '루', '무', '부', '수', '우', '주', '추', '쿠', '투', '푸', '후',
    // 이 행
    '기', '니', '디', '리', '미', '비', '시', '이', '지', '치', '키', '티', '피', '히',
    // 어 행
    '거', '너', '더', '러', '머', '버', '서', '어', '저', '처', '커', '터', '퍼', '허',
    // 으 행
    '그', '느', '드', '르', '므', '브', '스', '으', '즈', '츠', '크', '트', '프', '흐',
    // 요 행
    '교', '뇨', '료', '묘', '뵤', '쇼', '요', '죠', '쵸', '쿄', '툐', '표', '효',
    // 유 행
    '규', '뉴', '듀', '류', '뮤', '뷰', '슈', '유', '쥬', '츄', '큐', '튜', '퓨', '휴',
    // 얘/예 행
    '계', '네', '데', '레', '메', '베', '세', '예', '제', '체', '케', '테', '페', '헤'
  ];

  const wrongLetters: string[] = [];
  const usedLetters = new Set(correctLetters);

  // 정답 글자와 겹치지 않는 오답 글자를 count개 만큼 생성
  while (wrongLetters.length < count && wrongLetters.length < allLetters.length) {
    const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
    if (!usedLetters.has(randomLetter)) {
      wrongLetters.push(randomLetter);
      usedLetters.add(randomLetter);
    }
  }

  return wrongLetters;
};

type GameState = 'selectPlayer' | 'playing' | 'success' | 'failed';
type Speed = 'slow' | 'medium' | 'fast';

interface Word {
  word: string;
  emoji: string;
  category: string;
}

interface Letter {
  id: number;
  letter: string;
  isCorrect: boolean;
  position: number;
  delay: number;
  clicked: boolean;
}

interface Player {
  id: number;
  name: string;
  image: string;
  bgColor: string;
}

interface HangulGameProps {
  onBack: () => void;
  speed: Speed;
}

export default function HangulGame({ onBack, speed }: HangulGameProps) {
  const [gameState, setGameState] = useState<GameState>('selectPlayer');
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [fallingLetters, setFallingLetters] = useState<Letter[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const cheerSoundRef = useRef<HTMLAudioElement | null>(null);

  // 플레이어 데이터
  const players: Player[] = [
    { id: 1, name: '도원', image: getAssetPath('/players/dowon.jpeg'), bgColor: 'bg-pink-400' },
    { id: 2, name: '승우', image: getAssetPath('/players/seungwoo.jpeg'), bgColor: 'bg-blue-400' }
  ];

  // 속도 설정
  const speedSettings = {
    slow: { duration: 15, interval: 3500 },
    medium: { duration: 10, interval: 2500 },
    fast: { duration: 7, interval: 1800 }
  };

  // 새 단어 시작
  const startNewWord = () => {
    let filteredWords;
    if (consecutiveCorrect >= 20) {
      filteredWords = wordDatabase.filter(w => w.word.length >= 3 && w.word.length <= 5);
    } else if (consecutiveCorrect >= 10) {
      filteredWords = wordDatabase.filter(w => w.word.length >= 3 && w.word.length <= 4);
    } else {
      filteredWords = wordDatabase.filter(w => w.word.length <= 3);
    }

    const randomWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    setCurrentWord(randomWord);
    setSelectedLetters([]);

    const correctLetters = getHangulLetters(randomWord.word);
    const wrongLetters = getRandomWrongLetters(correctLetters, 4);
    const totalLetters = [...correctLetters, ...wrongLetters].sort(() => Math.random() - 0.5);

    const positions: number[] = [];
    const minGap = 13;

    totalLetters.forEach(() => {
      let position: number = 0;
      let attempts = 0;
      do {
        position = Math.random() * 90 + 2;
        attempts++;
      } while (
        attempts < 50 &&
        positions.some(pos => Math.abs(pos - position) < minGap)
      );
      positions.push(position);
    });

    const allLetters = totalLetters.map((letter, index) => ({
      id: Math.random(),
      letter,
      isCorrect: correctLetters.includes(letter),
      position: positions[index],
      delay: Math.random() * 3,
      clicked: false
    }));

    setFallingLetters(allLetters);
    setGameState('playing');
  };

  // 글자 선택 처리
  const handleLetterClick = (clickedLetter: Letter) => {
    if (gameState !== 'playing') return;
    if (clickedLetter.clicked) return;

    const correctLetters = getHangulLetters(currentWord!.word);
    const nextCorrectLetter = correctLetters[selectedLetters.length];

    if (clickedLetter.letter === nextCorrectLetter) {
      setFallingLetters(prev =>
        prev.map(l => l.id === clickedLetter.id ? { ...l, clicked: true } : l)
      );

      setSelectedLetters([...selectedLetters, clickedLetter.letter]);

      if (selectedLetters.length + 1 === correctLetters.length) {
        setScore(score + 1);
        setConsecutiveCorrect(consecutiveCorrect + 1);
        setGameState('success');

        if (cheerSoundRef.current && !isMuted) {
          cheerSoundRef.current.currentTime = 0;
          cheerSoundRef.current.play().catch(err => {
            console.log('환호 효과음 재생 실패:', err);
          });
        }

        setTimeout(() => startNewWord(), 2000);
      }
    }
  };

  // 재시도
  const handleRetry = () => {
    startNewWord();
  };

  // 플레이어 선택
  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setScore(0);
    setConsecutiveCorrect(0);

    if (bgmRef.current && !isMuted) {
      bgmRef.current.play().catch(err => {
        console.log('BGM 재생 실패:', err);
      });
    }

    startNewWord();
  };

  // BGM 및 효과음 재생 관리
  useEffect(() => {
    if (typeof window !== 'undefined' && !bgmRef.current) {
      bgmRef.current = new Audio(getAssetPath('/sounds/bgm.mp3'));
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3;
    }

    if (typeof window !== 'undefined' && !cheerSoundRef.current) {
      cheerSoundRef.current = new Audio(getAssetPath('/sounds/cheer.mp3'));
      cheerSoundRef.current.volume = 0.5;
    }

    if (gameState === 'playing' && bgmRef.current && !isMuted) {
      bgmRef.current.play().catch(err => {
        console.log('BGM 자동재생 실패 (사용자 인터랙션 필요):', err);
      });
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    };
  }, [gameState, isMuted]);

  // 음소거 토글
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (bgmRef.current) {
      if (!isMuted) {
        bgmRef.current.pause();
      } else {
        bgmRef.current.play().catch(err => console.log('BGM 재생 실패:', err));
      }
    }
  };

  // 땅에 닿은 글자 감지
  useEffect(() => {
    if (gameState !== 'playing' || !currentWord) return;

    const handleAnimationEnd = (e: AnimationEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('falling-letter')) return;

      const letterId = parseFloat(target.dataset.letterId || '0');
      const letter = fallingLetters.find(l => l.id === letterId);

      if (!letter || letter.clicked) return;

      const correctLetters = getHangulLetters(currentWord.word);
      const isCorrectLetter = correctLetters.includes(letter.letter);

      if (isCorrectLetter) {
        setConsecutiveCorrect(0);
        setGameState('failed');
      }
    };

    const gameArea = gameAreaRef.current;
    if (gameArea) {
      gameArea.addEventListener('animationend', handleAnimationEnd as EventListener);
      return () => gameArea.removeEventListener('animationend', handleAnimationEnd as EventListener);
    }
  }, [gameState, currentWord, fallingLetters, selectedLetters]);

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {/* 플레이어 선택 화면 */}
      {gameState === 'selectPlayer' && (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-300 via-purple-300 to-pink-400 p-8">
          <h2 className="dongle-font text-8xl font-bold text-white mb-16 drop-shadow-2xl">
            누가 할까요? 🎮
          </h2>
          <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player)}
                className={`${player.bgColor} rounded-3xl p-12 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all`}
              >
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden">
                  <Image
                    src={player.image}
                    alt={player.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-5xl font-bold text-white drop-shadow-lg">
                  {player.name}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={onBack}
            className="mt-12 px-12 py-6 bg-gray-600 text-white text-3xl font-bold rounded-2xl hover:bg-gray-700 transition-all"
          >
            ← 뒤로가기
          </button>
        </div>
      )}

      {/* 게임 화면 */}
      {(gameState === 'playing' || gameState === 'success' || gameState === 'failed') && currentWord && selectedPlayer && (
        <div className="relative w-full h-full bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-300">
          {/* 상단 정보 바 */}
          <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90 shadow-lg p-6 flex justify-between items-center z-20">
            <div className="flex items-center gap-6">
              <div className={`${selectedPlayer.bgColor} rounded-full p-2 relative w-20 h-20 overflow-hidden`}>
                <Image
                  src={selectedPlayer.image}
                  alt={selectedPlayer.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700">{selectedPlayer.name}</p>
                <p className="text-2xl text-gray-500">맞춘 개수: {score}개 🌟</p>
                <p className="text-xl text-gray-500">
                  연속: {consecutiveCorrect}개
                  {consecutiveCorrect >= 20 && ' 🔥🔥🔥'}
                  {consecutiveCorrect >= 10 && consecutiveCorrect < 20 && ' 🔥🔥'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="px-6 py-4 bg-blue-500 text-white text-3xl font-bold rounded-2xl hover:bg-blue-600 transition-all"
                title={isMuted ? '소리 켜기' : '소리 끄기'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={onBack}
                className="px-8 py-4 bg-red-500 text-white text-2xl font-bold rounded-2xl hover:bg-red-600 transition-all"
              >
                그만하기
              </button>
            </div>
          </div>

          {/* 제시어 영역 */}
          <div className="absolute top-32 left-0 right-0 flex flex-col items-center z-10">
            <div className="bg-white rounded-3xl shadow-2xl p-8 flex items-center gap-8">
              <div className="text-9xl">{currentWord.emoji}</div>
              <div>
                <p className="text-6xl font-bold text-gray-800 dongle-font">{currentWord.word}</p>
                <div className="flex gap-3 mt-4">
                  {getHangulLetters(currentWord.word).map((letter, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold ${
                        selectedLetters[index]
                          ? 'bg-green-400 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {selectedLetters[index] || '?'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 게임 영역 */}
          <div ref={gameAreaRef} className="absolute top-80 left-0 right-0 bottom-0 overflow-hidden">
            {fallingLetters.map((letter) => (
              <button
                key={letter.id}
                data-letter-id={letter.id}
                onClick={() => handleLetterClick(letter)}
                disabled={letter.clicked}
                className={`falling-letter absolute rounded-2xl text-5xl font-bold w-24 h-24 flex items-center justify-center transition-colors transform ${
                  letter.clicked
                    ? 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50 shadow-md'
                    : 'bg-white text-gray-900 hover:bg-yellow-200 cursor-pointer hover:scale-110 shadow-2xl border-2 border-gray-200'
                }`}
                style={{
                  left: `${letter.position}%`,
                  animationDuration: `${speedSettings[speed].duration}s`,
                  animationDelay: `${letter.delay}s`,
                  // @ts-ignore
                  '--fall-distance': '800px',
                  boxShadow: letter.clicked
                    ? '0 4px 6px rgba(0, 0, 0, 0.1)'
                    : '0 10px 25px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)'
                }}
              >
                {letter.letter}
              </button>
            ))}
          </div>

          {/* 성공 오버레이 */}
          {gameState === 'success' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
              <div className="celebrate bg-white rounded-3xl p-16 text-center shadow-2xl">
                <div className="text-9xl mb-6">🎉</div>
                <p className="text-7xl font-bold text-green-500 dongle-font mb-4">정답!</p>
                <p className="text-4xl text-gray-600">잘했어요, {selectedPlayer.name}! 🌟</p>
              </div>
            </div>
          )}

          {/* 실패 오버레이 */}
          {gameState === 'failed' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
              <div className="shake bg-white rounded-3xl p-16 text-center shadow-2xl">
                <div className="text-9xl mb-6">😅</div>
                <p className="text-7xl font-bold text-orange-500 dongle-font mb-4">아쉬워요!</p>
                <p className="text-4xl text-gray-600 mb-8">다시 해볼까요?</p>
                <button
                  onClick={handleRetry}
                  className="px-12 py-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-4xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  다시 하기 🔄
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
