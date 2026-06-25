export type WordType = 'word' | 'secret';

export type Direction =
  | 'right'
  | 'left'
  | 'down'
  | 'up'
  | 'diagonal-down-right'
  | 'diagonal-down-left'
  | 'diagonal-up-right'
  | 'diagonal-up-left';

export type WordItem = {
  word: string;
  clue: string;
  type: WordType;
};

export type PlacedWord = {
  word: string;
  clue: string;
  type: WordType;
  startRow: number;
  startCol: number;
  direction: Direction;
  positions: { row: number; col: number }[];
};

export type Worksheet = {
  id: string; // e.g., "H-2026-0001"
  title: string;
  unit: string;
  secretMessage: string; // full secret message string (space-separated words)
  secretWords: string[]; // parsed secret words array
  gridSize: number;
  words: WordItem[];
  placedWords: PlacedWord[];
  grid: string[][];
  isPublic: boolean;
  createdAt: string;
};

export type GridSize = 10 | 12 | 15;

export type GenerateResult = {
  success: boolean;
  grid: string[][];
  placedWords: PlacedWord[];
  failedWords: string[];
};
