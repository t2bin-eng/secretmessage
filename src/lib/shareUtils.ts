'use client';

import { Worksheet, WordItem } from '@/types/worksheet';

/**
 * 학생 플레이에 필요한 최소 데이터
 * 클루(clue)는 별도 배열로 분리해서 JSON 키 오버헤드 최소화
 */
export interface SharedWorksheet {
  id: string;
  title: string;
  unit: string;
  secretMessage: string;
  secretWords: string[];
  gridSize: number;
  grid: string[][];
  words: WordItem[];
  isPublic: boolean;
}

/** 2D 배열 → 평탄 문자열 */
function flattenGrid(grid: string[][]): string {
  return grid.map((row) => row.join('')).join('');
}

/** 평탄 문자열 → 2D 배열 */
function unflattenGrid(flat: string, size: number): string[][] {
  const grid: string[][] = [];
  // 한글·영문·숫자 혼합에 대응하기 위해 [...flat] 스프레드 사용 (surrogate pair 안전)
  const chars = [...flat];
  for (let r = 0; r < size; r++) {
    grid.push(chars.slice(r * size, (r + 1) * size));
  }
  return grid;
}

/**
 * 압축 포맷 인코딩
 * 키 이름을 최소화하고 그리드를 평탄 문자열로 저장해 URL 길이 절감
 */
function buildCompact(ws: Worksheet) {
  return {
    i: ws.id,
    t: ws.title,
    u: ws.unit,
    s: ws.secretMessage,
    sw: ws.secretWords ?? [],
    g: ws.gridSize,
    // 그리드: 2D 배열 → 평탄 문자열 (JSON 오버헤드 대폭 절감)
    gr: flattenGrid(ws.grid),
    // words: [word, clue, type] 배열 형태로 압축
    w: ws.words.map((wi) => [wi.word, wi.clue, wi.type]),
    p: ws.isPublic ? 1 : 0,
  };
}

function parseCompact(c: ReturnType<typeof buildCompact>): SharedWorksheet {
  return {
    id: c.i,
    title: c.t,
    unit: c.u,
    secretMessage: c.s,
    secretWords: c.sw,
    gridSize: c.g,
    grid: unflattenGrid(c.gr, c.g),
    words: (c.w as [string, string, string][]).map(([word, clue, type]) => ({
      word,
      clue,
      type: type as 'word' | 'secret',
    })),
    isPublic: c.p === 1,
  };
}

/**
 * 한글 포함 JSON → base64url
 */
export function encodeWorksheet(ws: Worksheet): string {
  const compact = buildCompact(ws);
  const json = JSON.stringify(compact);
  const base64 = btoa(
    encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * base64url → SharedWorksheet
 */
export function decodeWorksheet(encoded: string): SharedWorksheet | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const raw = JSON.parse(json);

    // 압축 포맷인지 일반 포맷인지 판별
    if ('gr' in raw) {
      // 압축 포맷
      const data = parseCompact(raw as ReturnType<typeof buildCompact>);
      if (!data.grid || !data.words || !data.id) return null;
      return data;
    } else {
      // 구버전 일반 포맷 호환
      const data = raw as SharedWorksheet;
      if (!data.grid || !data.words || !data.id) return null;
      return data;
    }
  } catch {
    return null;
  }
}

/**
 * 학생용 공유 URL 생성: /play/[id]?d=[base64url]
 */
export function buildStudentUrl(baseOrigin: string, ws: Worksheet): string {
  const encoded = encodeWorksheet(ws);
  return `${baseOrigin}/play/${ws.id}?d=${encoded}`;
}
