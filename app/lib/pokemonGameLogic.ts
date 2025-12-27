// Pokemon IQ Puzzle Game - Core Logic

import type {
  Cell,
  Shape,
  RuleType,
  Puzzle,
  PokemonId,
  POKEMON_IMAGES,
} from '../types/pokemonGame';
import { COLORS, RULE_ORDER } from '../types/pokemonGame';

// ============================================
// Shape Templates (Relative Positions)
// ============================================

type Template = { x: number; y: number }[];

export const SHAPE_TEMPLATES: { [key: string]: Template } = {
  // Simple shapes (3-4 blocks) - Level 1
  L_SHAPE: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
  T_SHAPE: [
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
  ],
  SQUARE: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
  LINE_3: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
  ],

  // Medium shapes (4-5 blocks) - Level 2
  Z_SHAPE: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
  ],
  PLUS: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  L_BIG: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
  ],
  CORNER: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
  ],

  // Complex shapes (5-6 blocks) - Level 3
  STAIRS: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
  ],
  ARROW: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
  ],
  CROSS: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  BLOCK_6: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
  ],
};

// Get templates by complexity
const SIMPLE_TEMPLATES = ['L_SHAPE', 'T_SHAPE', 'SQUARE', 'LINE_3'];
const MEDIUM_TEMPLATES = ['Z_SHAPE', 'PLUS', 'L_BIG', 'CORNER'];
const COMPLEX_TEMPLATES = ['STAIRS', 'ARROW', 'CROSS', 'BLOCK_6'];

// ============================================
// Utility Functions
// ============================================

// Get random pokemon ID
export function getRandomPokemon(): PokemonId {
  const pokemons = [
    'pikachu',
    'bulbasaur',
    'charmander',
    'squirtle',
    'chikorita',
    'cyndaquil',
    'totodile',
    'eevee',
    'lucario',
    'mewtwo',
  ] as const;
  return pokemons[Math.floor(Math.random() * pokemons.length)];
}

// Deep copy shape
export function cloneShape(shape: Shape): Shape {
  return {
    cells: shape.cells.map((c) => ({ ...c })),
    rotation: shape.rotation,
    orientation: shape.orientation,
  };
}

// Rotate a cell 90° clockwise around center (2,2)
function rotateCell(cell: Cell, degrees: 90 | 180 | 270): Cell {
  let { x, y } = cell;
  const cx = 2,
    cy = 2; // center of 5x5 grid

  // Translate to origin
  x -= cx;
  y -= cy;

  // Rotate
  for (let i = 0; i < degrees / 90; i++) {
    const temp = x;
    x = -y;
    y = temp;
  }

  // Translate back
  x += cx;
  y += cy;

  return { ...cell, x, y };
}

// Apply rotation to shape
export function rotateShape(shape: Shape, degrees: 90 | 180 | 270): Shape {
  return {
    ...shape,
    cells: shape.cells.map((c) => rotateCell(c, degrees)),
    rotation: ((shape.rotation + degrees) % 360) as 0 | 90 | 180 | 270,
  };
}

// Flip shape vertically
export function flipShape(shape: Shape): Shape {
  return {
    ...shape,
    cells: shape.cells.map((c) => ({ ...c, y: 4 - c.y })),
    orientation: shape.orientation === 'normal' ? 'flipped' : 'normal',
  };
}

// Translate shape (move all cells)
export function translateShape(
  shape: Shape,
  dx: number,
  dy: number
): Shape | null {
  const newCells = shape.cells.map((c) => ({
    ...c,
    x: c.x + dx,
    y: c.y + dy,
  }));

  // Check bounds (must stay in 0-4 range)
  if (newCells.some((c) => c.x < 0 || c.x > 4 || c.y < 0 || c.y > 4)) {
    return null;
  }

  return {
    ...shape,
    cells: newCells,
  };
}

// Find adjacent empty position
function findAdjacentEmpty(cells: Cell[]): { x: number; y: number } | null {
  const occupied = new Set(cells.map((c) => `${c.x},${c.y}`));

  for (const cell of cells) {
    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ];

    for (const n of neighbors) {
      if (
        n.x >= 0 &&
        n.x <= 4 &&
        n.y >= 0 &&
        n.y <= 4 &&
        !occupied.has(`${n.x},${n.y}`)
      ) {
        return n;
      }
    }
  }

  return null;
}

// Compare two shapes for equality
export function shapesEqual(a: Shape, b: Shape): boolean {
  if (a.cells.length !== b.cells.length) return false;

  const aSet = new Set(a.cells.map((c) => `${c.x},${c.y},${c.color}`));
  const bSet = new Set(b.cells.map((c) => `${c.x},${c.y},${c.color}`));

  if (aSet.size !== bSet.size) return false;

  for (const item of aSet) {
    if (!bSet.has(item)) return false;
  }

  return true;
}

// ============================================
// Rule Application Functions
// ============================================

export function applyRule(shape: Shape, rule: RuleType): Shape | null {
  switch (rule) {
    case 'ROTATE':
      return rotateShape(cloneShape(shape), 90);

    case 'ADD_BLOCK': {
      const adjacent = findAdjacentEmpty(shape.cells);
      if (!adjacent) return null;

      const newShape = cloneShape(shape);
      newShape.cells.push({
        ...adjacent,
        color: shape.cells[0].color,
        pokemonId: getRandomPokemon(),
      });
      return newShape;
    }

    case 'REMOVE_BLOCK': {
      if (shape.cells.length <= 1) return null;
      const newShape = cloneShape(shape);
      newShape.cells.pop();
      return newShape;
    }

    case 'MOVE': {
      const newShape = translateShape(cloneShape(shape), 1, 0); // Move right
      if (!newShape) {
        // If can't move right, try move up
        return translateShape(cloneShape(shape), 0, -1);
      }
      return newShape;
    }

    case 'COLOR_SHIFT': {
      if (shape.cells.length < 2) return null;
      const newShape = cloneShape(shape);

      // Swap colors between first and last block
      const temp = newShape.cells[0].color;
      newShape.cells[0].color = newShape.cells[newShape.cells.length - 1].color;
      newShape.cells[newShape.cells.length - 1].color = temp;

      return newShape;
    }

    case 'ORIENTATION':
      return flipShape(cloneShape(shape));

    case 'PARTIAL_CHANGE': {
      // Change color of first block only
      const newShape = cloneShape(shape);
      const colors = Object.values(COLORS);
      const currentColor = newShape.cells[0].color;
      const otherColors = colors.filter((c) => c !== currentColor);
      newShape.cells[0].color =
        otherColors[Math.floor(Math.random() * otherColors.length)];
      return newShape;
    }

    default:
      return null;
  }
}

// ============================================
// Shape Creation
// ============================================

export function createShape(
  template: Template,
  color: string,
  pokemonId?: PokemonId
): Shape {
  const pokemon = pokemonId || getRandomPokemon();
  return {
    cells: template.map((pos) => ({
      x: pos.x,
      y: pos.y,
      color,
      pokemonId: pokemon,
    })),
    rotation: 0,
    orientation: 'normal',
  };
}

// Select random template based on level
function selectTemplate(level: number): Template {
  let pool: string[];

  if (level === 1) {
    pool = SIMPLE_TEMPLATES;
  } else if (level === 2) {
    pool = MEDIUM_TEMPLATES;
  } else {
    pool = COMPLEX_TEMPLATES;
  }

  const key = pool[Math.floor(Math.random() * pool.length)];
  return SHAPE_TEMPLATES[key];
}

// Select color based on rule
function selectColor(rule: RuleType): string {
  switch (rule) {
    case 'ROTATE':
      return COLORS.BLUE;
    case 'ADD_BLOCK':
      return COLORS.GREEN;
    case 'REMOVE_BLOCK':
      return COLORS.ORANGE;
    case 'MOVE':
      return COLORS.PURPLE;
    case 'COLOR_SHIFT':
      return COLORS.RED; // Will use multiple colors
    case 'ORIENTATION':
      return COLORS.YELLOW;
    case 'PARTIAL_CHANGE':
      return COLORS.RED;
    default:
      return COLORS.BLUE;
  }
}

// ============================================
// Puzzle Generation
// ============================================

export function generatePuzzle(level: number, rule: RuleType): Puzzle | null {
  const sequenceLength = level === 1 ? 2 : level === 2 ? 3 : 4;
  const answerCount = level === 1 ? 2 : 3;

  // Create base shape
  const template = selectTemplate(level);
  const color = selectColor(rule);
  const startShape = createShape(template, color);

  // Generate sequence
  const sequence: Shape[] = [startShape];
  for (let i = 1; i < sequenceLength; i++) {
    const next = applyRule(sequence[i - 1], rule);
    if (!next) return null; // Rule failed (e.g., can't add more blocks)
    sequence.push(next);
  }

  // Generate correct answer
  const correctAnswer = applyRule(sequence[sequence.length - 1], rule);
  if (!correctAnswer) return null;

  // Generate wrong answers
  const wrongAnswers = generateWrongAnswers(correctAnswer, rule, answerCount);
  if (wrongAnswers.length < answerCount) return null; // Failed to generate enough wrong answers

  return {
    level,
    rule,
    sequence,
    correctAnswer,
    wrongAnswers: wrongAnswers.slice(0, answerCount),
  };
}

// ============================================
// Wrong Answer Generation
// ============================================

function generateWrongAnswers(
  correct: Shape,
  rule: RuleType,
  count: number
): Shape[] {
  const wrong: Shape[] = [];

  // Strategy 1: Apply wrong rotation (for ROTATE rule)
  if (rule === 'ROTATE') {
    const wrong180 = rotateShape(cloneShape(correct), 90); // Over-rotate
    if (!shapesEqual(wrong180, correct)) {
      wrong.push(wrong180);
    }
  }

  // Strategy 2: Apply different rule
  const otherRules = (['ROTATE', 'MOVE', 'ORIENTATION'] as RuleType[]).filter(
    (r) => r !== rule
  );
  for (const otherRule of otherRules) {
    if (wrong.length >= count) break;
    const wrongShape = applyRule(cloneShape(correct), otherRule);
    if (wrongShape && !shapesEqual(wrongShape, correct)) {
      wrong.push(wrongShape);
    }
  }

  // Strategy 3: Different color, same shape
  if (wrong.length < count) {
    const wrongColor = cloneShape(correct);
    const colors = Object.values(COLORS);
    const otherColors = colors.filter((c) => c !== correct.cells[0].color);
    wrongColor.cells.forEach((cell) => {
      cell.color = otherColors[Math.floor(Math.random() * otherColors.length)];
    });
    if (!shapesEqual(wrongColor, correct)) {
      wrong.push(wrongColor);
    }
  }

  // Strategy 4: Random similar shape
  while (wrong.length < count) {
    const template = selectTemplate(1); // Use simple template
    const randomShape = createShape(template, correct.cells[0].color);
    if (!shapesEqual(randomShape, correct)) {
      wrong.push(randomShape);
    }
  }

  return wrong;
}

// ============================================
// Progress Management
// ============================================

export function getNextProgress(
  currentRuleIndex: number,
  currentLevel: number
): { ruleIndex: number; level: number } {
  if (currentLevel < 3) {
    // Stay on same rule, increment level
    return { ruleIndex: currentRuleIndex, level: currentLevel + 1 };
  } else {
    // Move to next rule, reset to level 1
    const nextRuleIndex = (currentRuleIndex + 1) % RULE_ORDER.length;
    return { ruleIndex: nextRuleIndex, level: 1 };
  }
}
