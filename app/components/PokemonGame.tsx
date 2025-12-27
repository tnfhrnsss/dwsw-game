'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getAssetPath } from '../lib/basePath';
import type {
  Shape,
  Puzzle,
  GameState,
  Player,
  GameProgress,
} from '../types/pokemonGame';
import { RULE_ORDER } from '../types/pokemonGame';
import { generatePuzzle, shapesEqual, getNextProgress } from '../lib/pokemonGameLogic';

// Component Props
interface PokemonGameProps {
  onBack: () => void;
}

// ============================================
// ShapeView Component - Renders a single shape in 5x5 grid
// ============================================

interface ShapeViewProps {
  shape: Shape;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
}

function ShapeView({ shape, size = 'medium', isSelected = false }: ShapeViewProps) {
  const gridSize = size === 'small' ? 120 : size === 'medium' ? 180 : 240;
  const cellSize = gridSize / 5;

  return (
    <div
      className={`rounded-xl bg-gray-100 p-1 transition-all shape-view ${
        isSelected ? 'ring-4 ring-green-500 scale-105' : ''
      }`}
      style={{ width: gridSize, height: gridSize }}
    >
      <div className="grid grid-cols-5 grid-rows-5 gap-0.5 h-full">
        {Array.from({ length: 25 }).map((_, i) => {
          const x = i % 5;
          const y = Math.floor(i / 5);
          const cell = shape.cells.find((c) => c.x === x && c.y === y);

          return (
            <div
              key={i}
              className="rounded-sm relative flex items-center justify-center"
              style={{
                backgroundColor: cell ? cell.color : 'white',
                width: cellSize - 2,
                height: cellSize - 2,
              }}
            >
              {cell?.pokemonId && (
                <Image
                  src={getAssetPath(`/poketmonster/${cell.pokemonId}.png`)}
                  alt={cell.pokemonId}
                  width={Math.floor(cellSize)}
                  height={Math.floor(cellSize)}
                  className="object-contain"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// QuestionMark Component
// ============================================

interface QuestionMarkProps {
  size?: 'small' | 'medium' | 'large';
}

function QuestionMark({ size = 'medium' }: QuestionMarkProps) {
  const gridSize = size === 'small' ? 80 : size === 'medium' ? 120 : 160;

  return (
    <div
      className="rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center shape-view"
      style={{ width: gridSize, height: gridSize }}
    >
      <span className="text-6xl md:text-8xl font-bold text-purple-600">?</span>
    </div>
  );
}

// ============================================
// ProblemBoard Component
// ============================================

interface ProblemBoardProps {
  sequence: Shape[];
  level: number;
}

function ProblemBoard({ sequence, level }: ProblemBoardProps) {
  const size = level === 3 ? 'small' : 'medium';

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 mb-6 md:mb-8">
      <h2 className="text-2xl md:text-4xl font-bold text-purple-700">
        패턴을 찾아보세요!
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {sequence.map((shape, idx) => (
          <ShapeView key={idx} shape={shape} size={size} />
        ))}
        <QuestionMark size={size} />
      </div>
    </div>
  );
}

// ============================================
// AnswerOption Component
// ============================================

interface AnswerOptionProps {
  shape: Shape;
  onClick: () => void;
  isSelected: boolean;
  disabled: boolean;
}

function AnswerOption({ shape, onClick, isSelected, disabled }: AnswerOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-2xl p-4 transition-all transform hover:scale-105
        ${isSelected ? 'bg-green-100 ring-4 ring-green-500' : 'bg-white'}
        ${!disabled && !isSelected ? 'hover:shadow-xl' : ''}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      <ShapeView shape={shape} size="large" isSelected={isSelected} />
    </button>
  );
}

// ============================================
// Main PokemonGame Component
// ============================================

export default function PokemonGame({ onBack }: PokemonGameProps) {
  const [gameState, setGameState] = useState<GameState>('selectPlayer');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<Shape | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<Shape[]>([]);
  const [progress, setProgress] = useState<GameProgress>({
    currentRuleIndex: 0,
    currentLevel: 1,
    totalSolved: 0,
  });
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
    },
  ];

  // ============================================
  // Audio Setup
  // ============================================

  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio(getAssetPath('/sounds/bgm.mp3'));
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.3;
    }

    if (!cheerSoundRef.current) {
      cheerSoundRef.current = new Audio(getAssetPath('/sounds/cheer.mp3'));
      cheerSoundRef.current.volume = 0.5;
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    };
  }, []);

  // Play/pause BGM based on game state and mute
  useEffect(() => {
    if (bgmRef.current) {
      if (gameState === 'playing' && !isMuted) {
        bgmRef.current.play().catch((e) => console.log('BGM play failed:', e));
      } else {
        bgmRef.current.pause();
      }
    }
  }, [gameState, isMuted]);

  // Shuffle answers when puzzle changes
  useEffect(() => {
    if (currentPuzzle) {
      const allAnswers = [
        currentPuzzle.correctAnswer,
        ...currentPuzzle.wrongAnswers,
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(allAnswers);
    }
  }, [currentPuzzle]);

  // ============================================
  // Game Logic
  // ============================================

  // Generate new puzzle
  const createNewPuzzle = () => {
    const rule = RULE_ORDER[progress.currentRuleIndex];
    let puzzle = generatePuzzle(progress.currentLevel, rule);

    // Retry if generation failed
    let retries = 0;
    while (!puzzle && retries < 5) {
      puzzle = generatePuzzle(progress.currentLevel, rule);
      retries++;
    }

    if (puzzle) {
      setCurrentPuzzle(puzzle);
      setSelectedAnswer(null);
      setGameState('playing');
    }
  };

  // Start game with selected player
  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setProgress({
      currentRuleIndex: 0,
      currentLevel: 1,
      totalSolved: 0,
    });
    createNewPuzzle();
  };

  // Check answer
  const handleAnswerSelect = (answer: Shape) => {
    if (gameState !== 'playing' || !currentPuzzle) return;

    setSelectedAnswer(answer);

    setTimeout(() => {
      const isCorrect = shapesEqual(answer, currentPuzzle.correctAnswer);

      if (isCorrect) {
        setGameState('success');
        if (cheerSoundRef.current && !isMuted) {
          cheerSoundRef.current.play().catch((e) => console.log('Cheer sound failed:', e));
        }
      } else {
        setGameState('failed');
      }
    }, 300);
  };

  // Next level
  const handleNextLevel = () => {
    const next = getNextProgress(progress.currentRuleIndex, progress.currentLevel);
    setProgress({
      currentRuleIndex: next.ruleIndex,
      currentLevel: next.level,
      totalSolved: progress.totalSolved + 1,
    });
    createNewPuzzle();
  };

  // Retry same puzzle
  const handleRetry = () => {
    setSelectedAnswer(null);
    setGameState('playing');
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // ============================================
  // Render: Player Selection
  // ============================================

  if (gameState === 'selectPlayer') {
    return (
      <div className="w-full min-h-screen overflow-y-auto bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300">
        <div className="flex flex-col items-center py-8 md:py-16 px-4 md:px-8">
          <div className="text-center space-y-4 md:space-y-8 mb-8 md:mb-16">
            <h1 className="dongle-font text-6xl md:text-9xl font-bold text-white drop-shadow-2xl animate-bounce">
              도형 IQ 게임 🧩
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

  // ============================================
  // Render: Game Screen
  // ============================================

  if (!currentPuzzle || shuffledAnswers.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200">
        <div className="text-4xl font-bold text-purple-700">문제 생성 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 p-4 md:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {selectedPlayer && (
            <>
              <Image
                src={selectedPlayer.image}
                alt={selectedPlayer.name}
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
              <span className="text-2xl font-bold text-black">
                {selectedPlayer.name}
              </span>
            </>
          )}
        </div>

        <div className="text-xl md:text-2xl font-bold text-purple-700">
          {RULE_ORDER[progress.currentRuleIndex]} - Level {progress.currentLevel}
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleMute}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
          >
            그만하기
          </button>
        </div>
      </div>

      {/* Problem Board */}
      <ProblemBoard sequence={currentPuzzle.sequence} level={progress.currentLevel} />

      {/* Answer Choices */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-purple-700">
          정답을 선택하세요:
        </h3>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {shuffledAnswers.map((answer, idx) => (
            <AnswerOption
              key={idx}
              shape={answer}
              onClick={() => handleAnswerSelect(answer)}
              isSelected={selectedAnswer !== null && shapesEqual(selectedAnswer, answer)}
              disabled={gameState !== 'playing'}
            />
          ))}
        </div>
      </div>

      {/* Feedback Overlay */}
      {gameState === 'success' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-celebrate">
            <div className="text-6xl md:text-8xl mb-4">🎉</div>
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
              정답입니다!
            </h2>
            <button
              onClick={handleNextLevel}
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl md:text-3xl font-bold rounded-2xl hover:shadow-2xl transition-all"
            >
              다음 문제 →
            </button>
          </div>
        </div>
      )}

      {gameState === 'failed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-shake">
            <div className="text-6xl md:text-8xl mb-4">😅</div>
            <h2 className="text-4xl md:text-5xl font-bold text-orange-600 mb-6">
              다시 생각해보세요!
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
