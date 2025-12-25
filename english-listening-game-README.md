# 영어 듣기 기억력 게임 - Listen & Find 🎧🔍

## 프로젝트 개요
6~7살 어린이를 위한 영어 학습 게임입니다. 영어 음성으로 들은 단어들을 기억해서 화면에서 해당 그림을 찾아 터치하는 게임입니다.

## 타겟 디바이스
- 갤럭시 탭 태블릿
- 터치 기반 인터페이스
- 스피커/이어폰 필요 (음성 출력)

## 핵심 게임 메커니즘

### 게임 플레이 흐름

0. **게임 선택**
   - 메인 화면에서 "한글 배우기", "공룡 메모리 게임" 옆에 "영어 듣기 게임" 카드 추가
   - 보라색/분홍색 그라데이션 배경에 🎧 아이콘 표시

1. **플레이어 선택**
   - 도원, 승우 중 선택
   - 플레이어 사진과 이름 표시

2. **음성 듣기 단계**
   - 영어 음성이 자동으로 랜덤 재생됨
   - 예: "Apple, Banana" (음성으로만, 텍스트 없음)
   - 아이가 듣고 기억해야 함
   - 음성 속도: 0.2 (매우 천천히, 7살 어린이 최적화)
   - 음성 재생 후 자동으로 찾기 화면으로 전환

3. **그림 찾기 단계**
   - 화면에 여러 그림과 한글 이름이 표시됨 (8~12개)
   - 들은 단어에 해당하는 그림을 터치
   - **순서는 상관없음** (순서 기억 부담 제거)
   - 예: 🍎 사과, 🍌 바나나 터치
   - 시간 제한 없음
   - **그림 터치 시 소리 효과** (Web Audio API 사용 - 800Hz beep 소리)
   - **각 그림 아래 한글 이름 표시** (예: 사과, 바나나)

4. **힌트 기능 - "모르겠습니다" 버튼**
   - 노란색 "모르겠습니다" 버튼 클릭
   - 음성 다시 재생
   - 화면 중앙에 토스트 메시지로 정답 표시 (이모지 + 한글)
   - 3초 후 자동으로 사라짐

5. **정답 확인**
   - 들은 단어를 모두 맞게 선택했는지 확인
   - 하나라도 빠지거나 틀리면 오답
   - 모두 맞으면 성공!
   - 성공 시 환호 사운드 재생 (public/sounds/cheer.mp3)
   - 정답/오답 시각적 피드백 (초록색/빨간색 테두리)

6. **피드백**
   - 정답: 🎉 애니메이션 + 다음 레벨
   - 오답: 😢 + "다시하기" 버튼 → 재시도

### 난이도 단계별 구성 (새로운 레벨 시스템)

**같은 단어 개수로 10번 성공해야 다음 단계로 이동**

#### **레벨 1-10: 2개 단어 단계**
- 음성: "Apple, Banana"
- 화면: 8개 그림 (정답 2개 + 오답 6개)
- 목표: 2개 찾기
- 단어 난이도: 레벨 1-2 (쉬운 단어만)
- 10번 성공하면 레벨 11로 진행

#### **레벨 11-20: 3개 단어 단계**
- 음성: "Dog, Cat, Apple"
- 화면: 8개 그림 (정답 3개 + 오답 5개)
- 목표: 3개 찾기
- 단어 난이도: 레벨 1-3
- 10번 성공하면 레벨 21로 진행

#### **레벨 21-30: 4개 단어 단계**
- 음성: "Red, Blue, Sun, Tree"
- 화면: 12개 그림 (정답 4개 + 오답 8개)
- 목표: 4개 찾기
- 단어 난이도: 레벨 1-4
- 10번 성공하면 레벨 31로 진행

#### **레벨 31-40: 5개 단어 단계**
- 음성: "Cat, Dog, Apple, Car, Star"
- 화면: 12개 그림 (정답 5개 + 오답 7개)
- 목표: 5개 찾기
- 단어 난이도: 레벨 1-5
- 10번 성공하면 레벨 41로 진행

#### **레벨 41+: 6개 단어 단계**
- 음성: "Sun, Moon, Star, Tree, Flower, Cloud"
- 화면: 12개 그림 (정답 6개 + 오답 6개)
- 목표: 6개 찾기
- 단어 난이도: 레벨 1-6 (모든 단어)

## 주요 기능

### 1. 음성 시스템 (Web Speech API)

```javascript
// 음성 합성 설정 (실제 구현)
const speak = (words) => {
  const utterance = new SpeechSynthesisUtterance(words.join(', '));
  utterance.lang = 'en-US';
  utterance.rate = 0.2; // 매우 천천히 (7살 어린이용)
  utterance.pitch = 1.0;
  utterance.volume = 1.0; // 최대 볼륨

  // 음성 종료 시 자동으로 찾기 화면 전환
  utterance.onend = () => {
    setGameState('finding');
  };

  speechSynthesis.speak(utterance);

  // 안전장치: 타임아웃 (rate 0.2 기준)
  const estimatedDuration = words.length * 7000 + (words.length - 1) * 2000 + 1000;
  setTimeout(transitionToFinding, estimatedDuration);
};
```

### 2. 터치 사운드 (Web Audio API)

```javascript
// 그림 터치 시 beep 소리 재생
const playTapSound = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800; // 800Hz
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};
```

### 3. 단어 데이터베이스

#### 카테고리별 단어 (총 104개)

**모든 단어는 level 속성 포함** (난이도 1-6)

**동물 (Animals) - 25개**
```javascript
[
  { word: 'dog', emoji: '🐕', koreanName: '강아지', level: 1 },
  { word: 'cat', emoji: '🐱', koreanName: '고양이', level: 1 },
  { word: 'fish', emoji: '🐟', koreanName: '물고기', level: 1 },
  { word: 'bird', emoji: '🐦', koreanName: '새', level: 1 },
  { word: 'rabbit', emoji: '🐰', koreanName: '토끼', level: 2 },
  { word: 'bear', emoji: '🐻', koreanName: '곰', level: 2 },
  { word: 'lion', emoji: '🦁', koreanName: '사자', level: 2 },
  { word: 'elephant', emoji: '🐘', koreanName: '코끼리', level: 4 },
  { word: 'giraffe', emoji: '🦒', koreanName: '기린', level: 5 },
  // ... 총 25개
]
```

**과일 (Fruits) - 20개**
```javascript
[
  { word: 'apple', emoji: '🍎', koreanName: '사과', level: 1 },
  { word: 'banana', emoji: '🍌', koreanName: '바나나', level: 1 },
  { word: 'grape', emoji: '🍇', koreanName: '포도', level: 2 },
  { word: 'orange', emoji: '🍊', koreanName: '오렌지', level: 2 },
  { word: 'strawberry', emoji: '🍓', koreanName: '딸기', level: 3 },
  { word: 'watermelon', emoji: '🍉', koreanName: '수박', level: 4 },
  { word: 'pineapple', emoji: '🍍', koreanName: '파인애플', level: 5 },
  { word: 'avocado', emoji: '🥑', koreanName: '아보카도', level: 6 },
  // ... 총 20개
]
```

**색깔 (Colors) - 12개**
```javascript
[
  { word: 'red', emoji: '🔴', koreanName: '빨강', level: 1 },
  { word: 'blue', emoji: '🔵', koreanName: '파랑', level: 1 },
  { word: 'yellow', emoji: '🟡', koreanName: '노랑', level: 1 },
  { word: 'green', emoji: '🟢', koreanName: '초록', level: 2 },
  { word: 'purple', emoji: '🟣', koreanName: '보라', level: 3 },
  { word: 'gold', emoji: '🟡', koreanName: '금색', level: 4 },
  // ... 총 12개
]
```

**숫자 (Numbers) - 10개**
```javascript
[
  { word: 'one', emoji: '1️⃣', koreanName: '일', level: 1 },
  { word: 'two', emoji: '2️⃣', koreanName: '이', level: 1 },
  { word: 'three', emoji: '3️⃣', koreanName: '삼', level: 2 },
  // ... 총 10개
]
```

**자연 (Nature) - 15개**
**탈것 (Vehicles) - 10개**
**음식 (Food) - 12개**

### 4. 게임 로직

#### 레벨별 단어 선택 로직

```javascript
// 레벨에 따른 단어 개수
const getWordCount = (level) => {
  if (level <= 10) return 2;   // 레벨 1-10: 2개
  if (level <= 20) return 3;   // 레벨 11-20: 3개
  if (level <= 30) return 4;   // 레벨 21-30: 4개
  if (level <= 40) return 5;   // 레벨 31-40: 5개
  return 6;                    // 레벨 41+: 6개
};

// 레벨별 단어 난이도 필터링
const selectWords = (count, gameLevel) => {
  let maxWordLevel;
  if (gameLevel <= 10) maxWordLevel = 2;
  else if (gameLevel <= 20) maxWordLevel = 3;
  else if (gameLevel <= 30) maxWordLevel = 4;
  else if (gameLevel <= 40) maxWordLevel = 5;
  else maxWordLevel = 6;

  const availableWords = allWords.filter(w => w.level <= maxWordLevel);
  return shuffleAndSelect(availableWords, count);
};
```

#### 정답 체크 로직

```javascript
const checkAnswer = (selectedWords, correctWords) => {
  // 개수 확인
  if (selectedWords.length !== correctWords.length) {
    return false;
  }

  // 순서 상관없이 모든 단어 포함 여부 확인
  const correctWordSet = new Set(correctWords.map(w => w.word));
  const selectedWordSet = new Set(selectedWords.map(w => w.word));

  for (let word of correctWordSet) {
    if (!selectedWordSet.has(word)) {
      return false;
    }
  }

  return true;
};
```

### 5. UI/UX 구현

#### 화면 구성

```
┌─────────────────────────────────────────────┐
│ 👤 도원  |  Level 5  |  🔊 다시듣기  |  ❤️❤️❤️│ ← 상단바
├─────────────────────────────────────────────┤
│                                             │
│   🍎      🍌      🐕      🐱              │
│  사과   바나나   강아지   고양이            │ ← 그림 그리드
│                                             │  (이모지 + 한글)
│   ⭐      🌳      🍕      🔴              │
│   별     나무    피자    빨강              │
│                                             │
├─────────────────────────────────────────────┤
│  [확인하기]  [모르겠습니다]  [그만하기]       │ ← 하단 버튼
└─────────────────────────────────────────────┘
```

#### 상태별 화면

**1. 플레이어 선택**
- 플레이어 사진과 이름 표시
- 도원(분홍색), 승우(파란색) 카드

**2. 듣기 단계**
- 큰 스피커 아이콘 🔊
- "Listen carefully!" 문구
- 음성 재생 중 표시
- 하트 3개 표시 (다시 듣기 가능 횟수)

**3. 찾기 단계**
- 그림 카드: 이모지(text-8xl) + 한글(text-2xl)
- 선택 시: 초록색 테두리 + 확대 효과
- 터치 시: beep 소리
- 그림 간격: gap-6 (넓은 간격)

**4. 힌트 토스트**
- 화면 중앙 고정
- 검은 배경 (80% 투명도)
- 정답 이모지와 한글 표시
- 3초 후 자동 사라짐

**5. 성공**
- 🎉 애니메이션
- 환호 사운드
- "다음 레벨 →" 버튼

**6. 실패**
- 😢 이모지
- "다시하기" 버튼

#### 시각적 피드백

```css
/* 선택한 그림 */
.selected {
  border: 4px solid #4CAF50;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
}

/* 정답 표시 */
.correct {
  border: 4px solid #4CAF50;
  animation: celebrate 0.5s;
}

/* 오답 표시 */
.wrong {
  border: 4px solid #F44336;
  animation: shake 0.3s;
}
```

### 6. 특수 기능

#### 다시 듣기 버튼
- 각 문제당 3번까지 다시 들을 수 있음
- 하트 개수로 표시 (❤️❤️❤️)
- 클릭 시 음성 재생 및 하트 감소

#### 모르겠습니다 버튼
- 노란색 버튼 (bg-yellow-500)
- 클릭 시:
  1. 음성 다시 재생
  2. 토스트 메시지로 정답 힌트 표시
  3. 3초 후 토스트 자동 사라짐

#### 플레이어 시스템
- 도원, 승우 프로필 관리
- 각 플레이어별 진행 상황 저장 가능 (추후 확장)

## 기술 스택
- **프론트엔드**: React (TypeScript) / Next.js
- **음성**: Web Speech API (영어 음성 합성)
- **터치 사운드**: Web Audio API (beep 효과음)
- **스타일링**: Tailwind CSS
- **상태 관리**: React Hooks (useState, useEffect, useRef)
- **이미지**: Next.js Image 컴포넌트
- **배포**: Vercel (정적 사이트 export)

## 파일 구조
```
app/
├── components/
│   └── EnglishListeningGame.tsx  (메인 게임 컴포넌트)
├── lib/
│   └── basePath.ts               (경로 헬퍼)
├── page.tsx                      (메인 페이지 - 게임 선택)
└── globals.css

public/
├── players/
│   ├── dowon.jpeg
│   └── seungwoo.jpeg
└── sounds/
    └── cheer.mp3
```

## 주요 설정값

### 음성 설정
```typescript
utterance.rate = 0.2;      // 음성 속도 (0.1 ~ 10, 기본값 1)
                           // 테스트 추천: 0.15 ~ 0.3
utterance.pitch = 1.0;     // 음높이
utterance.volume = 1.0;    // 볼륨 (최대값, 변경 불가)
```

### UI 크기 설정
```typescript
이모지 크기: text-8xl
한글 크기: text-2xl
그림 간격: gap-6
```

### 색상 설정
```typescript
플레이어 이름: text-black
레벨 표시: text-black
확인하기: bg-green-500
모르겠습니다: bg-yellow-500
그만하기: bg-gray-600
```

## 성능 최적화
- 음성 합성 사전 테스트 (브라우저 호환성)
- 이미지는 이모지 사용 (로딩 시간 제거)
- React.memo로 불필요한 리렌더링 방지
- 음성 재생 중 UI 블로킹 방지
- Web Audio API 사용으로 터치 소리 즉시 재생

## 접근성 고려사항
- 큰 터치 영역 (aspect-square 그리드)
- 명확한 시각적 피드백 (초록색/빨간색 테두리)
- 음성 지원 (Web Speech API)
- 한글 이름 병기로 단어 학습 지원
- 색맹 고려 (이모지 + 색상 조합)

## 학습 효과

이 게임을 통해 아이들은:
- ✅ **영어 듣기 능력** 향상
- ✅ **단어 인지력** 발달
- ✅ **단기 기억력** 강화
- ✅ **집중력** 향상
- ✅ **영어 발음** 자연스럽게 학습
- ✅ **시각-청각 연결** 능력 발달
- ✅ **한글-영어 대응** 학습

## 향후 개선 아이디어
- 문장 듣기 모드 ("The apple is red")
- 스토리 모드 (짧은 이야기 듣고 순서대로 그림 선택)
- 멀티플레이어 (누가 먼저 찾나 경쟁)
- 녹음 기능 (아이가 따라 말하기)
- AI 발음 평가 (Speech Recognition API)
- 부모 대시보드 (학습 진행도)
- 테마별 단어장 (동물원, 슈퍼마켓 등)
- 플레이어별 진행 상황 저장 (localStorage)

## 개발 시 주의사항

1. **음성 재생 타이밍**: rate 0.2 기준 단어당 7초 + 쉼표 2초
2. **음성 속도**: 너무 빠르지 않게 (현재: 0.2)
3. **재생 확인**: 음성이 끝났는지 확인 후 다음 단계
4. **브라우저 정책**: 사용자 인터랙션 후 음성 재생
5. **메모리 관리**: speechSynthesis.cancel() 적절히 호출
6. **에러 처리**: 음성 API 실패 시 대체 방안 (setTimeout)

## 참고 자료
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- SpeechSynthesisUtterance: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
- Next.js Image: https://nextjs.org/docs/api-reference/next/image

## 개발 완료 체크리스트
- [x] 단어 데이터베이스 구성 (104개, level 속성 포함)
- [x] Web Speech API 음성 합성 (rate: 0.2)
- [x] 레벨 시스템 구현 (10번 성공 후 다음 단계)
- [x] 기본 게임 로직 (음성 재생, 그림 선택, 정답 체크)
- [x] 플레이어 선택 및 이미지 표시
- [x] 기본 UI (상단바, 그림 그리드, 하단 버튼)
- [x] 그림 터치 소리 (Web Audio API)
- [x] 그림 아래 한글 이름 표시
- [x] "모르겠습니다" 버튼 및 토스트 메시지
- [x] 다시 듣기 기능 (하트 3개)
- [x] 성공/실패 피드백
- [x] 환호 사운드 재생
- [x] 메인 페이지에 게임 카드 추가
- [x] 레벨별 단어 난이도 필터링
- [x] UI 스타일링 (Tailwind CSS)

Let's make learning fun! 🎉🎧
