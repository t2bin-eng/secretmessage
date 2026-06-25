'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { WordItem } from '@/types/worksheet';
import { ParseResult } from '@/lib/excel';
import { generateGrid } from '@/lib/wordGrid';
import { saveWorksheet } from '@/lib/storage';
import { GRID_SIZES, APP_NAME, APP_SUBTITLE } from '@/lib/constants';
import ExcelTemplateButton from '@/components/ExcelTemplateButton';
import ExcelUploader from '@/components/ExcelUploader';

type GridSize = 10 | 12 | 15;

export default function NewWorksheetPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [gridSize, setGridSize] = useState<GridSize>(12);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const handleParsed = (result: ParseResult) => {
    setParseResult(result);
    setGenError('');
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      alert('활동지 제목을 입력하세요.');
      return;
    }
    if (!parseResult || !parseResult.success) {
      alert('유효한 엑셀 파일을 먼저 업로드하세요.');
      return;
    }

    setGenerating(true);
    setGenError('');

    // Run generation (allow a tick for UI update)
    await new Promise((r) => setTimeout(r, 50));

    let result = generateGrid(parseResult.words, gridSize);

    // Retry with larger size if needed
    if (!result.success && gridSize < 15) {
      const bigger: GridSize = gridSize === 10 ? 12 : 15;
      result = generateGrid(parseResult.words, bigger);
      if (result.success) {
        setGenError(
          `단어 배치를 위해 그리드 크기를 ${bigger}×${bigger}로 자동 조정했습니다.`
        );
      }
    }

    if (!result.success && result.failedWords.length > 0) {
      setGenError(
        `일부 단어를 배치하지 못했습니다: ${result.failedWords.join(', ')}. 더 큰 그리드 크기를 선택하거나 단어를 줄여보세요.`
      );
    }

    const ws = saveWorksheet({
      title: title.trim(),
      unit: unit.trim(),
      secretMessage: parseResult.secretMessage,
      secretWords: parseResult.secretWords,
      gridSize,
      words: parseResult.words,
      placedWords: result.placedWords,
      grid: result.grid,
      isPublic: true,
    });

    setGenerating(false);
    router.push(`/admin/qr/${ws.id}`);
  };

  const wordItems = parseResult?.words.filter((w) => w.type === 'word') ?? [];
  const secretItems = parseResult?.words.filter((w) => w.type === 'secret') ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-indigo-200 text-sm hover:text-white">
            ← 목록으로
          </Link>
          <h1 className="text-xl font-bold mt-1">{APP_NAME}</h1>
          <p className="text-indigo-200 text-sm">{APP_SUBTITLE}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">새 활동지 만들기</h2>

        {/* Basic Info */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-lg">① 기본 정보</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              활동지 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 개항기 주요 역사 용어 찾기"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              관련 단원
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="예: 3단원. 개항기와 국권 피탈"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </section>

        {/* Excel */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 text-lg">② 엑셀 파일 업로드</h3>
          <div className="flex gap-3 items-center">
            <ExcelTemplateButton />
            <p className="text-sm text-gray-500">← 먼저 양식을 다운로드하여 작성하세요</p>
          </div>
          <ExcelUploader onParsed={handleParsed} />

          {parseResult?.success && (
            <div className="mt-4 space-y-3">
              {/* Word list preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  ✅ 단어 {wordItems.length}개 인식됨
                </p>
                <div className="max-h-48 overflow-y-auto border rounded-lg divide-y text-sm">
                  {wordItems.map((w, i) => (
                    <div key={i} className="flex px-3 py-2 gap-4">
                      <span className="font-bold text-indigo-700 min-w-[80px]">{w.word}</span>
                      <span className="text-gray-600">{w.clue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secret message */}
              {parseResult.secretMessage && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-amber-800">
                    🔒 시크릿 메시지: &quot;{parseResult.secretMessage}&quot;
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    단어판에 숨겨질 조각:{' '}
                    {secretItems.map((s) => s.word).join(' / ')}
                  </p>
                </div>
              )}

              {parseResult.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
                  {parseResult.errors.map((e, i) => (
                    <p key={i}>⚠ {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Grid Size */}
        <section className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-700 text-lg mb-4">③ 단어판 크기 선택</h3>
          <div className="flex gap-4">
            {GRID_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size as GridSize)}
                className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors ${
                  gridSize === size
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">단어 수가 많을수록 큰 크기를 권장합니다.</p>
        </section>

        {/* Generate */}
        {genError && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 text-sm text-yellow-800">
            ⚠ {genError}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !parseResult?.success || !title.trim()}
          className="w-full py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? '생성 중...' : '🎯 활동지 생성하기'}
        </button>
      </main>
    </div>
  );
}
