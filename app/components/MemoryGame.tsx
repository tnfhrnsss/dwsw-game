'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAssetPath } from '../lib/basePath';

// 공룡 카드 데이터베이스
// 이미지 파일을 public/dinosaurs/ 폴더에 넣어주세요
// 예: brachiosaurus.png, tyrannosaurus.png 등
const dinosaurs = [
  { id: 1, image: getAssetPath('/dinosaurs/brachiosaurus.png'), name: '브라키오사우루스' },
  { id: 2, image: getAssetPath('/dinosaurs/tyrannosaurus.png'), name: '티라노사우루스' },
  { id: 3, image: getAssetPath('/dinosaurs/triceratops.png'), name: '트리케라톱스' },
  { id: 4, image: getAssetPath('/dinosaurs/velociraptor.png'), name: '벨로시랩터' },
  { id: 5, image: getAssetPath('/dinosaurs/spinosaurus.png'), name: '스피노사우루스' },
  { id: 6, image: getAssetPath('/dinosaurs/ankylosaurus.png'), name: '안킬로사우루스' },
  { id: 7, image: getAssetPath('/dinosaurs/pteranodon.png'), name: '프테라노돈' },
  { id: 8, image: getAssetPath('/dinosaurs/stegosaurus.png'), name: '스테고사우루스' },
];

type GameState = 'start' | 'selectPlayer' | 'preview' | 'playing' | 'checking' | 'levelComplete' | 'gameComplete';

interface Player {
  id: number;
  name: string;
  image: string;
  bgColor: string;
}

interface Card {
  id: number;
  dinoId: number;
  image: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onBack: () => void;
}

export default function MemoryGame({ onBack }: MemoryGameProps) {
  const [gameState, setGameState] = useState<GameState>('selectPlayer');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [firstCard, setFirstCard] = useState<Card | null>(null);
  const [secondCard, setSecondCard] = useState<Card | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const cheerSoundRef = useRef<HTMLAudioElement | null>(null);

  const players: Player[] = [
    { id: 1, name: '도원', image: getAssetPath('/players/dowon.jpeg'), bgColor: 'bg-pink-400' },
    { id: 2, name: '승우', image: getAssetPath('/players/seungwoo.jpeg'), bgColor: 'bg-blue-400' }
  ];

  // 카드 생성 및 섞기 - 4장(2쌍) 또는 6장(3쌍) 랜덤
  const createCards = () => {
    // 랜덤하게 2쌍 또는 3쌍 선택
    const pairCount = Math.random() < 0.5 ? 2 : 3;

    // 공룡을 랜덤하게 섞은 후 필요한 만큼만 선택
    const shuffledDinos = [...dinosaurs].sort(() => Math.random() - 0.5);
    const selectedDinos = shuffledDinos.slice(0, pairCount);

    const cardPairs: Card[] = [];
    selectedDinos.forEach((dino) => {
      cardPairs.push({
        id: Math.random() * 1000000,
        dinoId: dino.id,
        image: dino.image,
        name: dino.name,
        isFlipped: false,
        isMatched: false
      });
      cardPairs.push({
        id: Math.random() * 1000000,
        dinoId: dino.id,
        image: dino.image,
        name: dino.name,
        isFlipped: false,
        isMatched: false
      });
    });

    // Fisher-Yates 셔플
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    return cardPairs;
  };

  // 레벨 시작 (4장 또는 6장 랜덤)
  const startLevel = () => {
    const newCards = createCards();
    setCards(newCards.map(card => ({ ...card, isFlipped: true }))); // 처음엔 모두 뒤집힌 상태
    setMatchedPairs(0);
    setFirstCard(null);
    setSecondCard(null);
    setCountdown(3);
    setGameState('preview');
  };

  // 플레이어 선택
  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);

    // BGM 즉시 재생 시도 (사용자 클릭 이벤트 직후)
    if (bgmRef.current && !isMuted) {
      bgmRef.current.play().catch(err => {
        console.log('BGM 재생 실패:', err);
      });
    }

    startLevel();
  };

  // 카드 클릭 처리
  const handleCardClick = (clickedCard: Card) => {
    if (gameState !== 'playing') return;
    if (clickedCard.isFlipped || clickedCard.isMatched) return;
    if (firstCard && secondCard) return;

    const newCards = cards.map(card =>
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    if (!firstCard) {
      setFirstCard(clickedCard);
    } else {
      setSecondCard(clickedCard);
      setGameState('checking');

      // 0.5초 후 비교
      setTimeout(() => {
        checkMatch(clickedCard);
      }, 500);
    }
  };

  // 카드 매칭 확인
  const checkMatch = (secondCard: Card) => {
    if (firstCard!.dinoId === secondCard.dinoId) {
      // 매칭 성공!
      const newMatchedPairs = matchedPairs + 1;
      setCards(prev => prev.map(card =>
        card.dinoId === firstCard!.dinoId ? { ...card, isMatched: true } : card
      ));
      setMatchedPairs(newMatchedPairs);

      // 모든 짝 맞췄는지 확인 - 현재 카드 수 / 2 = 총 쌍 개수
      const totalPairs = cards.length / 2;
      if (newMatchedPairs === totalPairs) {
        // 라운드 완료 시 환호 효과음 재생
        if (cheerSoundRef.current && !isMuted) {
          cheerSoundRef.current.currentTime = 0;
          cheerSoundRef.current.play().catch(err => {
            console.log('환호 효과음 재생 실패:', err);
          });
        }

        // 1초 후 다음 라운드 시작
        setTimeout(() => {
          startLevel();
        }, 1000);
      }
    } else {
      // 매칭 실패 - 다시 뒤집기
      setTimeout(() => {
        setCards(prev => prev.map(card =>
          (card.id === firstCard!.id || card.id === secondCard.id) && !card.isMatched
            ? { ...card, isFlipped: false }
            : card
        ));
      }, 1000);
    }

    setFirstCard(null);
    setSecondCard(null);
    setGameState('playing');
  };

  // 카운트다운
  useEffect(() => {
    if (gameState === 'preview' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'preview' && countdown === 0) {
      // 카드 뒤집기
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setGameState('playing');
    }
  }, [gameState, countdown]);

  // BGM 및 효과음 재생 관리
  useEffect(() => {
    // BGM 객체 생성
    if (typeof window !== 'undefined' && !bgmRef.current) {
      bgmRef.current = new Audio(getAssetPath('/sounds/bgm.mp3'));
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3; // 볼륨 30%
    }

    // 환호 효과음 객체 생성
    if (typeof window !== 'undefined' && !cheerSoundRef.current) {
      cheerSoundRef.current = new Audio(getAssetPath('/sounds/cheer.mp3'));
      cheerSoundRef.current.volume = 0.5; // 볼륨 50%
    }

    // 게임 시작 시 BGM 재생
    if ((gameState === 'playing' || gameState === 'preview') && bgmRef.current && !isMuted) {
      bgmRef.current.play().catch(err => {
        console.log('BGM 자동재생 실패 (사용자 인터랙션 필요):', err);
      });
    }

    // 게임 종료 시 BGM 정지
    if (gameState === 'selectPlayer' && bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
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

  // 다음 레벨로 진행
  const handleNextLevel = () => {
    setCurrentLevel(prev => prev + 1);
    startLevel();
  };

  // 게임 재시작
  const handleRestart = () => {
    setCurrentLevel(1);
    setSelectedPlayer(null);
    setGameState('selectPlayer');
  };

  // 그리드 클래스 계산 - 카드 수에 따라 동적으로 결정
  const getGridClass = () => {
    const totalCards = cards.length;
    if (totalCards === 4) return 'grid-cols-2'; // 2x2 (4장)
    if (totalCards === 6) return 'grid-cols-2'; // 3x2 (6장)
    return 'grid-cols-2'; // 기본값
  };

  return (
    <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-green-300 via-teal-200 to-blue-300">
      {/* 플레이어 선택 화면 */}
      {gameState === 'selectPlayer' && (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <h2 className="dongle-font text-8xl font-bold text-white mb-16 drop-shadow-2xl">
            누가 할까요? 🦕
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
      {(gameState === 'preview' || gameState === 'playing' || gameState === 'checking') && selectedPlayer && (
        <div className="flex flex-col h-full p-8">
          {/* 상단 정보 */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`${selectedPlayer.bgColor} rounded-full p-2 relative w-16 h-16 overflow-hidden`}>
                <Image src={selectedPlayer.image} alt={selectedPlayer.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-700">{selectedPlayer.name}</p>
                <p className="text-2xl text-gray-500">공룡 메모리 게임 🦕</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* 음소거 버튼 */}
              <button
                onClick={toggleMute}
                className="px-6 py-3 bg-blue-500 text-white text-2xl font-bold rounded-xl hover:bg-blue-600 transition-all"
                title={isMuted ? '소리 켜기' : '소리 끄기'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-red-500 text-white text-xl font-bold rounded-xl hover:bg-red-600"
              >
                그만하기
              </button>
            </div>
          </div>

          {/* 카운트다운 */}
          {gameState === 'preview' && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-9xl font-bold text-white drop-shadow-2xl animate-bounce">
                {countdown}
              </div>
            </div>
          )}

          {/* 카드 그리드 */}
          <div className="flex-1 flex items-center justify-center">
            <div className={`grid ${getGridClass()} gap-4 max-w-5xl`}>
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`relative w-48 h-60 rounded-2xl transform transition-all duration-300 ${
                    card.isMatched ? '' : 'hover:scale-105'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: (card.isFlipped || card.isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                  disabled={card.isMatched || gameState !== 'playing'}
                >
                  {/* 카드 뒷면 */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-9xl">❓</span>
                  </div>

                  {/* 카드 앞면 */}
                  <div
                    className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center shadow-xl p-4"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="relative w-32 h-32 mb-2">
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-700">{card.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 레벨 완료 화면 */}
      {gameState === 'levelComplete' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-3xl p-16 text-center shadow-2xl">
            <div className="text-9xl mb-6">🎉</div>
            <p className="text-7xl font-bold text-green-500 dongle-font mb-4">레벨 완료!</p>
            <p className="text-4xl text-gray-600 mb-8">잘했어요, {selectedPlayer?.name}! 🌟</p>
            <button
              onClick={handleNextLevel}
              className="px-12 py-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-4xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              다음 레벨 🚀
            </button>
          </div>
        </div>
      )}

      {/* 게임 완료 화면 */}
      {gameState === 'gameComplete' && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-3xl p-16 text-center shadow-2xl">
            <div className="text-9xl mb-6">🏆</div>
            <p className="text-7xl font-bold text-yellow-500 dongle-font mb-4">모든 레벨 완료!</p>
            <p className="text-4xl text-gray-600 mb-8">{selectedPlayer?.name} 최고! 🎉</p>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="px-12 py-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-4xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                처음부터 다시 🔄
              </button>
              <button
                onClick={onBack}
                className="px-12 py-6 bg-gray-600 text-white text-4xl font-bold rounded-2xl hover:bg-gray-700 transition-all"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
