'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { PlacedWord, Worksheet } from '@/types/worksheet';
import { getWorksheet } from '@/lib/storage';
import WordGrid from '@/components/WordGrid';
import AuthorCredit from '@/components/AuthorCredit';
import { APP_NAME, AUTHOR_CREDIT } from '@/lib/constants';

type Phase = 'login' | 'play' | 'complete';

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const [ws, setWs] = useState<Worksheet | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [phase, setPhase] = useState<Phase>('login');

  // Login
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');

  // Game state
  const [foundWords, setFoundWords] = useState<PlacedWord[]>([]);
  const [revealedSecretParts, setRevealedSecretParts] = useState<number>(0);

  useEffect(() => {
    const found = getWorksheet(id);
    if (!found) {
      setNotFound(true);
      return;
    }
    if (!found.isPublic) {
      setNotFound(true);
      return;
    }
    setWs(found);
  }, [id]);

  const handleStart = () => {
    if (!studentName.trim()) {
      alert('이름을 입력하세요.');
      return;
    }
    setPhase('play');
  };

  const handleWordFound = useCallback(
    (pw: PlacedWord) => {
      setFoundWords((prev) => {
        if (prev.some((f) => f.word === pw.word)) return prev;
        const next = [...prev, pw];

        // If this is a secret word, reveal the next part
        if (pw.type === 'secret') {
          setRevealedSecretParts((r) => r + 1);
        }

        return next;
      });
    },
    []
  );

  const handleSubmit = () => {
    setPhase('complete');
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">활동지를 찾을 수 없습니다</h1>
        <p className="text-gray-500 text-sm">
          주소가 잘못되었거나 비공개 활동지입니다.
        </p>
      </div>
    );
  }

  if (!ws) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  const regularWords = ws.placedWords.filter((pw) => pw.type === 'word');
  const secretWordsList = ws.placedWords.filter((pw) => pw.type === 'secret');
  const foundRegular = foundWords.filter((fw) => fw.type === 'word');
  const foundSecret = foundWords.filter((fw) => fw.type === 'secret');
  const allRegularFound = foundRegular.length === regularWords.length;
  const allFound = foundWords.length === ws.placedWords.length;

  // Build revealed secret message
  const secretParts = ws.secretWords ?? [];
  const revealedMessage = secretParts
    .map((part, i) => {
      const isFound = foundSecret.some((fw) => fw.word === part);
      return isFound ? part : '???';
    })
    .join(' ');

  // ─── Login Phase ───
  if (phase === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
          <p className="text-center text-xs text-gray-400 mb-1">{ws.unit}</p>
          <h1 className="text-xl font-bold text-center text-gray-800 mb-1">{ws.title}</h1>
          <p className="text-center text-xs text-indigo-500 font-mono mb-6">{ws.id}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">학번</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="학번 입력"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="이름 입력"
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              onClick={handleStart}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              활동 시작 🚀
            </button>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-400">{AUTHOR_CREDIT}</p>
      </div>
    );
  }

  // ─── Complete Phase ───
  if (phase === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-5xl mb-3">🎉</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">제출 완료!</h1>
          <p className="text-gray-600 text-sm mb-4">
            {studentName} 학생, 수고했습니다!
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
            <p>
              단어 찾기: <strong>{foundRegular.length}</strong> / {regularWords.length}
            </p>
            <p>
              시크릿 메시지: <strong>{foundSecret.length}</strong> / {secretWordsList.length}
            </p>
            {secretParts.length > 0 && (
              <p className="mt-2 text-amber-700 font-bold">
                🔒 시크릿 메시지: {ws.secretMessage}
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            다시 시작
          </button>
        </div>
        <p className="mt-6 text-xs text-gray-400">{AUTHOR_CREDIT}</p>
      </div>
    );
  }

  // ─── Play Phase ───
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-300">{ws.unit}</p>
            <h1 className="text-base font-bold leading-tight">{ws.title}</h1>
            <p className="text-xs text-indigo-300">{ws.id}</p>
          </div>
          <div className="text-right text-xs text-indigo-200">
            <p>{studentName}</p>
            <p>
              {foundRegular.length}/{regularWords.length} 찾음
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Clue list */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-gray-700 mb-3 text-sm">📋 단어 설명 목록</h2>
              <div className="space-y-2">
                {regularWords.map((pw, i) => {
                  const isFound = foundRegular.some((f) => f.word === pw.word);
                  return (
                    <div
                      key={i}
                      className={`text-xs px-3 py-2 rounded-lg ${
                        isFound
                          ? 'bg-green-50 text-green-700 line-through opacity-60'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-bold text-gray-400 mr-1">{i + 1}.</span>
                      {pw.clue}
                      {isFound && (
                        <span className="ml-1 font-bold not-italic no-underline">
                          ({pw.word})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Secret message section */}
              {secretParts.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-bold text-amber-700 text-sm mb-2">
                    🔒 시크릿 메시지 조각
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    단어판에서 시크릿 메시지 조각을 찾으세요!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {secretParts.map((part, i) => {
                      const isFound = foundSecret.some((fw) => fw.word === part);
                      return (
                        <div
                          key={i}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold text-center min-w-[48px] border-2 transition-all ${
                            isFound
                              ? 'bg-amber-300 border-amber-400 text-amber-900'
                              : 'bg-gray-100 border-gray-200 text-gray-400'
                          }`}
                        >
                          {isFound ? part : '???'}
                        </div>
                      );
                    })}
                  </div>
                  {foundSecret.length === secretParts.length && secretParts.length > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-amber-600 mb-1">🎊 시크릿 메시지 완성!</p>
                      <p className="font-bold text-amber-800 text-lg">{ws.secretMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Right: Word Grid */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-700 text-sm">단어 찾기 퍼즐</h2>
                <span className="text-xs text-gray-400">
                  시작 글자 → 끝 글자 순서로 클릭하세요
                </span>
              </div>
              <WordGrid
                grid={ws.grid}
                placedWords={ws.placedWords}
                onWordFound={handleWordFound}
                foundWords={foundWords}
              />
            </div>

            {/* Progress */}
            <div className="mt-4 bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">진행률</span>
                <span className="text-sm font-bold text-indigo-700">
                  {foundWords.length} / {ws.placedWords.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(foundWords.length / Math.max(ws.placedWords.length, 1)) * 100}%`,
                  }}
                />
              </div>
              {allRegularFound && secretParts.length === 0 && (
                <p className="text-green-600 text-sm font-bold mt-2 text-center">
                  🎉 모든 단어를 찾았습니다!
                </p>
              )}
              {allFound && ws.placedWords.length > 0 && (
                <p className="text-amber-600 text-sm font-bold mt-2 text-center">
                  🏆 퍼즐 완성!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-xs text-gray-400">{AUTHOR_CREDIT}</p>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
          >
            제출하기 ✓
          </button>
        </div>
      </div>
    </div>
  );
}
