'use client';

import { useState } from 'react';
import HangulGame from './components/HangulGame';
import MemoryGame from './components/MemoryGame';
import './hangul-game.css';

type GameType = 'hangul' | 'memory' | null;
type Speed = 'slow' | 'medium' | 'fast';

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [speed, setSpeed] = useState<Speed>('slow');
  const [showSpeedSelection, setShowSpeedSelection] = useState(false);

  // 한글 게임 선택
  const handleSelectHangulGame = () => {
    setShowSpeedSelection(true);
  };

  // 속도 선택 후 한글 게임 시작
  const handleStartHangulGame = () => {
    setSelectedGame('hangul');
  };

  // 메모리 게임 선택
  const handleSelectMemoryGame = () => {
    setSelectedGame('memory');
  };

  // 게임 선택 화면으로 돌아가기
  const handleBackToGameSelection = () => {
    setSelectedGame(null);
    setShowSpeedSelection(false);
  };

  // 속도 선택 화면에서 뒤로가기
  const handleBackFromSpeedSelection = () => {
    setShowSpeedSelection(false);
  };

  // 선택된 게임 렌더링
  if (selectedGame === 'hangul') {
    return <HangulGame onBack={handleBackToGameSelection} speed={speed} />;
  }

  if (selectedGame === 'memory') {
    return <MemoryGame onBack={handleBackToGameSelection} />;
  }

  // 속도 선택 화면 (한글 게임용)
  if (showSpeedSelection) {
    return (
      <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400">
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-center space-y-8 animate-bounce mb-16">
            <h1 className="dongle-font text-9xl font-bold text-white drop-shadow-2xl">
              한글 배우기 🎮
            </h1>
            <p className="text-4xl text-white font-bold drop-shadow-lg">
              떨어지는 글자를 맞춰보세요!
            </p>
          </div>

          <div className="space-y-6 w-full max-w-md">
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <p className="text-2xl font-bold text-gray-700 mb-4">속도 선택:</p>
              <div className="grid grid-cols-3 gap-4">
                {(['slow', 'medium', 'fast'] as Speed[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`py-6 px-4 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 ${
                      speed === s
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s === 'slow' ? '🐢 느림' : s === 'medium' ? '🐰 보통' : '🚀 빠름'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartHangulGame}
              className="w-full py-8 bg-gradient-to-r from-green-400 to-blue-500 text-white text-4xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              시작하기! 🎉
            </button>

            <button
              onClick={handleBackFromSpeedSelection}
              className="w-full py-6 bg-gray-600 text-white text-3xl font-bold rounded-2xl hover:bg-gray-700 transition-all"
            >
              ← 뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 게임 선택 화면
  return (
    <div className="w-full h-screen overflow-hidden relative bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300">
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center space-y-8 mb-16">
          <h1 className="dongle-font text-9xl font-bold text-white drop-shadow-2xl animate-bounce">
            조카들 학습 게임 🎮
          </h1>
          <p className="text-5xl text-white font-bold drop-shadow-lg">
            어떤 게임을 할까요?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* 한글 게임 카드 */}
          <button
            onClick={handleSelectHangulGame}
            className="bg-gradient-to-br from-yellow-300 via-orange-300 to-red-300 rounded-3xl p-12 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
          >
            <div className="text-9xl mb-6">📝</div>
            <h2 className="text-6xl font-bold text-white drop-shadow-lg mb-4 dongle-font">
              한글 배우기
            </h2>
            <p className="text-2xl text-white drop-shadow-md">
              떨어지는 글자를 맞춰보세요!
            </p>
          </button>

          {/* 메모리 게임 카드 */}
          <button
            onClick={handleSelectMemoryGame}
            className="bg-gradient-to-br from-green-300 via-teal-300 to-blue-300 rounded-3xl p-12 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
          >
            <div className="text-9xl mb-6">🦕</div>
            <h2 className="text-6xl font-bold text-white drop-shadow-lg mb-4 dongle-font">
              공룡 메모리 게임
            </h2>
            <p className="text-2xl text-white drop-shadow-md">
              같은 공룡 카드를 찾아보세요!
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
