import * as XLSX from 'xlsx';
import { WordItem } from '@/types/worksheet';

export interface ParseResult {
  success: boolean;
  words: WordItem[];
  secretMessage: string;
  secretWords: string[];
  errors: string[];
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const errors: string[] = [];
  const words: WordItem[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch {
    return { success: false, words: [], secretMessage: '', secretWords: [], errors: ['엑셀 파일을 읽을 수 없습니다.'] };
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
  });

  if (rows.length === 0) {
    return { success: false, words: [], secretMessage: '', secretWords: [], errors: ['엑셀 파일에 데이터가 없습니다.'] };
  }

  // Check required columns
  const firstRow = rows[0];
  const keys = Object.keys(firstRow).map((k) => k.toLowerCase().trim());
  if (!keys.includes('word')) {
    errors.push('"word" 열이 없습니다.');
  }
  if (!keys.includes('clue')) {
    errors.push('"clue" 열이 없습니다.');
  }
  if (errors.length > 0) {
    return { success: false, words: [], secretMessage: '', secretWords: [], errors };
  }

  // Extract secret message from first row
  let secretMessage = '';
  for (const row of rows) {
    const secretVal = String(
      Object.entries(row).find(([k]) => k.toLowerCase().trim() === 'secret')?.[1] ?? ''
    ).trim();
    if (secretVal) {
      secretMessage = secretVal;
      break;
    }
  }

  // Parse secret words (split by space)
  const secretWords = secretMessage
    ? secretMessage
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0)
    : [];

  // Parse word rows
  const seenWords = new Set<string>();
  for (const row of rows) {
    const word = String(
      Object.entries(row).find(([k]) => k.toLowerCase().trim() === 'word')?.[1] ?? ''
    )
      .trim()
      .replace(/\s+/g, '');
    const clue = String(
      Object.entries(row).find(([k]) => k.toLowerCase().trim() === 'clue')?.[1] ?? ''
    ).trim();

    if (!word) continue;

    if (!clue) {
      errors.push(`단어 "${word}"에 설명(clue)이 없습니다.`);
      continue;
    }

    if (seenWords.has(word)) {
      // Skip duplicates silently
      continue;
    }
    seenWords.add(word);

    words.push({ word, clue, type: 'word' });
  }

  // Add secret words as WordItems
  const seenSecret = new Set<string>();
  for (const sw of secretWords) {
    const clean = sw.replace(/\s+/g, '');
    if (!clean || seenSecret.has(clean)) continue;
    seenSecret.add(clean);
    words.push({
      word: clean,
      clue: '🔒 시크릿 메시지 조각',
      type: 'secret',
    });
  }

  if (words.filter((w) => w.type === 'word').length === 0) {
    errors.push('유효한 단어가 없습니다.');
    return { success: false, words: [], secretMessage, secretWords, errors };
  }

  return { success: true, words, secretMessage, secretWords, errors };
}

export function generateTemplate(): Blob {
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['word', 'clue', 'secret'],
    ['을사늑약', '1905년 일본이 대한제국의 외교권을 강제로 빼앗은 조약', '너를 사랑해'],
    ['갑오개혁', '1894년 조선 정부가 추진한 근대적 개혁 운동', ''],
    ['동학농민운동', '1894년 봉건제도와 외세에 저항한 농민들의 봉기', ''],
    ['독립선언서', '1919년 3·1 운동 당시 독립을 선포한 문서', ''],
    ['', '', ''],
    ['[시크릿 메시지 안내]', '', ''],
    ['시크릿 메시지(secret)는 첫 번째 데이터 행에만 입력하세요.', '', ''],
    ['예: 너를 사랑해 → 단어판에 "너를"과 "사랑해"가 숨겨집니다.', '', ''],
    ['학생이 두 조각을 모두 찾으면 시크릿 메시지가 완성됩니다.', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [{ wch: 16 }, { wch: 50 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws, '단어목록');
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
