'use client';

import { useState, useCallback } from 'react';
import { PlacedWord } from '@/types/worksheet';
import { getPositionsBetween, checkWordMatch } from '@/lib/wordGrid';

interface FoundWord {
  placedWord: PlacedWord;
  colorClass: string;
}

interface Props {
  grid: string[][];
  placedWords: PlacedWord[];
  onWordFound: (pw: PlacedWord) => void;
  foundWords: PlacedWord[];
}

const HIGHLIGHT_COLORS = [
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-pink-200',
  'bg-purple-200',
  'bg-orange-200',
  'bg-teal-200',
  'bg-red-200',
  'bg-indigo-200',
  'bg-lime-200',
];

const SECRET_COLOR = 'bg-amber-300';

export default function WordGrid({ grid, placedWords, onWordFound, foundWords }: Props) {
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const [shake, setShake] = useState(false);

  const gridSize = grid.length;

  // Build highlight map from found words
  const highlightMap: Record<string, { colorClass: string }> = {};
  foundWords.forEach((pw) => {
    const originalIndex = placedWords.findIndex((p) => p.word === pw.word);
    const colorClass =
      pw.type === 'secret'
        ? SECRET_COLOR
        : HIGHLIGHT_COLORS[Math.max(originalIndex, 0) % HIGHLIGHT_COLORS.length];
    pw.positions.forEach((p) => {
      highlightMap[`${p.row},${p.col}`] = { colorClass };
    });
  });

  // Preview path
  let previewPositions: { row: number; col: number }[] = [];
  if (startCell && hoverCell) {
    const path = getPositionsBetween(
      startCell.row,
      startCell.col,
      hoverCell.row,
      hoverCell.col,
      gridSize
    );
    if (path) previewPositions = path;
  }

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!startCell) {
        setStartCell({ row, col });
        return;
      }

      if (startCell.row === row && startCell.col === col) {
        setStartCell(null);
        return;
      }

      const positions = getPositionsBetween(startCell.row, startCell.col, row, col, gridSize);
      if (!positions) {
        setStartCell({ row, col });
        return;
      }

      const matched = checkWordMatch(positions, grid, placedWords);
      if (matched) {
        const alreadyFound = foundWords.some((fw) => fw.word === matched.word);
        if (!alreadyFound) {
          onWordFound(matched);
        }
        setStartCell(null);
      } else {
        // Wrong selection - shake and reset
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setStartCell(null);
      }
    },
    [startCell, gridSize, grid, placedWords, foundWords, onWordFound]
  );

  return (
    <div className="overflow-x-auto">
      <div
        className={`inline-block border-2 border-gray-800 ${shake ? 'animate-bounce' : ''}`}
        style={{ lineHeight: 0 }}
      >
        <table
          className="border-collapse"
          style={{ borderSpacing: 0 }}
          onMouseLeave={() => setHoverCell(null)}
        >
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => {
                  const key = `${r},${c}`;
                  const isStart = startCell?.row === r && startCell?.col === c;
                  const isPreview = previewPositions.some(
                    (p) => p.row === r && p.col === c
                  );
                  const highlight = highlightMap[key];

                  let bgClass = '';
                  if (highlight) {
                    bgClass = highlight.colorClass;
                  } else if (isStart) {
                    bgClass = 'bg-blue-400 text-white';
                  } else if (isPreview) {
                    bgClass = 'bg-blue-100';
                  }

                  return (
                    <td
                      key={c}
                      onClick={() => handleCellClick(r, c)}
                      onMouseEnter={() => {
                        if (startCell) setHoverCell({ row: r, col: c });
                      }}
                      className={`
                        w-8 h-8 sm:w-9 sm:h-9
                        text-center align-middle
                        border border-gray-300
                        font-bold text-sm sm:text-base
                        cursor-pointer select-none
                        transition-colors duration-100
                        hover:bg-blue-50
                        ${bgClass}
                      `}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {startCell && (
        <p className="text-xs text-blue-600 mt-2 text-center">
          시작: ({startCell.row + 1}, {startCell.col + 1}) — 끝 글자를 클릭하세요
        </p>
      )}
    </div>
  );
}
