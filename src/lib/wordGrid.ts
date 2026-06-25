import { Direction, GenerateResult, PlacedWord, WordItem } from '@/types/worksheet';
import { KOREAN_SYLLABLES } from './constants';

type Dir = { dr: number; dc: number; name: Direction };

const DIRECTIONS: Dir[] = [
  { dr: 0, dc: 1, name: 'right' },
  { dr: 1, dc: 0, name: 'down' },
  { dr: 1, dc: 1, name: 'diagonal-down-right' },
  { dr: 1, dc: -1, name: 'diagonal-down-left' },
  { dr: 0, dc: -1, name: 'left' },
  { dr: -1, dc: 0, name: 'up' },
  { dr: -1, dc: -1, name: 'diagonal-up-left' },
  { dr: -1, dc: 1, name: 'diagonal-up-right' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomKoreanChar(): string {
  const idx = Math.floor(Math.random() * KOREAN_SYLLABLES.length);
  return KOREAN_SYLLABLES[idx];
}

function canPlace(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  dir: Dir
): boolean {
  const size = grid.length;
  for (let i = 0; i < word.length; i++) {
    const r = startRow + dir.dr * i;
    const c = startCol + dir.dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  item: WordItem,
  startRow: number,
  startCol: number,
  dir: Dir,
  placements: PlacedWord[]
) {
  const positions: { row: number; col: number }[] = [];
  for (let i = 0; i < item.word.length; i++) {
    const r = startRow + dir.dr * i;
    const c = startCol + dir.dc * i;
    grid[r][c] = item.word[i];
    positions.push({ row: r, col: c });
  }
  placements.push({
    word: item.word,
    clue: item.clue,
    type: item.type,
    startRow,
    startCol,
    direction: dir.name,
    positions,
  });
}

export function generateGrid(items: WordItem[], gridSize: number): GenerateResult {
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill('')
  );
  const placements: PlacedWord[] = [];
  const failedWords: string[] = [];

  // Sort by word length descending (longer words harder to place, do first)
  const sorted = [...items].sort((a, b) => b.word.length - a.word.length);

  for (const item of sorted) {
    if (item.word.length > gridSize) {
      failedWords.push(item.word);
      continue;
    }

    let placed = false;
    const dirs = shuffle(DIRECTIONS);

    for (const dir of dirs) {
      if (placed) break;
      // Try up to 100 random positions
      for (let attempt = 0; attempt < 100; attempt++) {
        // Compute valid start range based on direction
        let rMin = 0,
          rMax = gridSize - 1,
          cMin = 0,
          cMax = gridSize - 1;
        if (dir.dr > 0) rMax = gridSize - item.word.length;
        if (dir.dr < 0) rMin = item.word.length - 1;
        if (dir.dc > 0) cMax = gridSize - item.word.length;
        if (dir.dc < 0) cMin = item.word.length - 1;

        if (rMin > rMax || cMin > cMax) continue;

        const r = rMin + Math.floor(Math.random() * (rMax - rMin + 1));
        const c = cMin + Math.floor(Math.random() * (cMax - cMin + 1));

        if (canPlace(grid, item.word, r, c, dir)) {
          placeWord(grid, item, r, c, dir, placements);
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      failedWords.push(item.word);
    }
  }

  // Fill empty cells with random Korean characters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = randomKoreanChar();
      }
    }
  }

  return {
    success: failedWords.length === 0,
    grid,
    placedWords: placements,
    failedWords,
  };
}

export function getPositionsBetween(
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  gridSize: number
): { row: number; col: number }[] | null {
  const dr = endRow - startRow;
  const dc = endCol - startCol;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return null;

  // Must be horizontal, vertical, or diagonal
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const stepR = len === 0 ? 0 : dr / len;
  const stepC = len === 0 ? 0 : dc / len;
  if (!Number.isInteger(stepR) || !Number.isInteger(stepC)) return null;

  const positions: { row: number; col: number }[] = [];
  for (let i = 0; i <= len; i++) {
    const r = startRow + stepR * i;
    const c = startCol + stepC * i;
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return null;
    positions.push({ row: r, col: c });
  }
  return positions;
}

export function checkWordMatch(
  positions: { row: number; col: number }[],
  grid: string[][],
  placedWords: PlacedWord[]
): PlacedWord | null {
  const selectedText = positions.map((p) => grid[p.row][p.col]).join('');
  return (
    placedWords.find((pw) => {
      if (pw.word !== selectedText) return false;
      if (pw.positions.length !== positions.length) return false;
      return pw.positions.every(
        (p, i) => p.row === positions[i].row && p.col === positions[i].col
      );
    }) ?? null
  );
}
