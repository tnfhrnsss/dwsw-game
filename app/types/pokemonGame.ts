// Pokemon IQ Puzzle Game - Type Definitions

// Cell in a 5x5 grid
export type Cell = {
  x: number;          // 0-4 column
  y: number;          // 0-4 row
  color: string;      // hex color
  pokemonId?: string; // optional: 'pikachu', 'bulbasaur', etc.
};

// Shape composed of cells
export type Shape = {
  cells: Cell[];
  rotation: 0 | 90 | 180 | 270;
  orientation: 'normal' | 'flipped';
};

// Rule types - ONE per puzzle
export type RuleType =
  | 'ROTATE'          // 90° rotation each step
  | 'ADD_BLOCK'       // +1 block each step
  | 'REMOVE_BLOCK'    // -1 block each step
  | 'MOVE'            // Position shift (right or up)
  | 'COLOR_SHIFT'     // Color positions swap
  | 'PARTIAL_CHANGE'  // Some blocks change
  | 'ORIENTATION';    // Vertical flip

// Complete puzzle
export type Puzzle = {
  level: number;              // 1-3
  rule: RuleType;
  sequence: Shape[];          // 2-4 shapes shown
  correctAnswer: Shape;
  wrongAnswers: Shape[];      // 2-3 wrong choices
};

// Game states
export type GameState =
  | 'selectPlayer'
  | 'playing'
  | 'success'
  | 'failed';

// Player interface
export interface Player {
  id: number;
  name: string;
  image: string;
  bgColor: string;
}

// Game progress tracking
export type GameProgress = {
  currentRuleIndex: number;  // 0-5 (which rule type)
  currentLevel: number;       // 1-3 (difficulty within rule)
  totalSolved: number;        // Total puzzles solved
};

// Pokemon image mapping
export const POKEMON_IMAGES = [
  'pikachu',
  'bulbasaur',
  'charmander',
  'squirtle',
  'chikorita',
  'cyndaquil',
  'totodile',
  'eevee',
  'lucario',
  'mewtwo'
] as const;

export type PokemonId = typeof POKEMON_IMAGES[number];

// Rule order for progression
export const RULE_ORDER: RuleType[] = [
  'ROTATE',
  'ADD_BLOCK',
  'REMOVE_BLOCK',
  'MOVE',
  'COLOR_SHIFT',
  'ORIENTATION'
];

// Color constants
export const COLORS = {
  BLUE: '#3B82F6',
  GREEN: '#10B981',
  ORANGE: '#F97316',
  RED: '#EF4444',
  YELLOW: '#FACC15',
  PURPLE: '#A855F7',
} as const;
