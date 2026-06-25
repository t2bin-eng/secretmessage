'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getWorksheet } from '@/lib/storage';
import { Worksheet } from '@/types/worksheet';
import { APP_NAME, APP_VERSION, AUTHOR_CREDIT, AUTHOR_NAME } from '@/lib/constants';
import { printStudentWorksheet, printTeacherAnswerKey, printQRGuide } from '@/lib/pdf';
import AuthorCredit from '@/components/AuthorCredit';

export default function QRPage() {
  const { id } = useParams<{ id: string }>();
  const [ws, setWs] = useState<Worksheet | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const studentUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/play/${id}` : '';

  useEffect(() => {
    const found = getWorksheet(id);
    setWs(found ?? null);
  }, [id]);

  useEffect(() => {
    if (!studentUrl || !ws) return;
    QRCode.toDataURL(studentUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    }).then(setQrDataUrl);
  }, [studentUrl, ws]);

  const handleCopy = () => {
    navigator.clipboard.writeText(studentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!ws) return <div className="p-8 text-center text-gray-400">불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-indigo-200 text-sm hover:text-white">
            ← 목록으로
          </Link>
          <h1 className="text-xl font-bold mt-1">{APP_NAME}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Worksheet Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <p className="text-xs text-indigo-600 font-mono font-bold mb-1">{ws.id}</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{ws.title}</h2>
          {ws.unit && <p className="text-sm text-gray-500">{ws.unit}</p>}
        </div>

        {/* QR Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col md:flex-row gap-8 items-center">
          {/* QR Code */}
          <div className="flex-shrink-0 text-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-56 h-56 mx-auto border-4 border-indigo-100 rounded-xl"
              />
            ) : (
              <div className="w-56 h-56 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                생성 중...
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">학생 접속 QR 코드</p>
          </div>

          {/* URL & Info */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">학생 접속 URL</p>
              <div className="flex gap-2 items-start">
                <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs break-all text-gray-800">
                  {studentUrl}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs text-indigo-500">그리드 크기</p>
                <p className="font-bold text-indigo-800">
                  {ws.gridSize}×{ws.gridSize}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-500">단어 수</p>
                <p className="font-bold text-purple-800">
                  {ws.words.filter((w) => w.type === 'word').length}개
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-amber-600">시크릿 메시지</p>
                <p className="font-bold text-amber-800">
                  {ws.secretMessage || '없음'}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              제작: {AUTHOR_NAME} | v{APP_VERSION}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700"
          >
            <span className="text-2xl">{copied ? '✅' : '📋'}</span>
            {copied ? 'URL 복사됨!' : 'URL 복사'}
          </button>

          <Link
            href={`/play/${ws.id}`}
            target="_blank"
            className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700"
          >
            <span className="text-2xl">👁</span>
            학생 화면 열기
          </Link>

          <button
            onClick={() => ws && printStudentWorksheet(ws)}
            className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700"
          >
            <span className="text-2xl">🖨</span>
            학생용 PDF
          </button>

          <button
            onClick={() => ws && printTeacherAnswerKey(ws)}
            className="flex flex-col items-center gap-1.5 py-4 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700"
          >
            <span className="text-2xl">🔑</span>
            교사용 정답
          </button>
        </div>

        <button
          onClick={() => ws && qrDataUrl && printQRGuide(ws, qrDataUrl, window.location.origin)}
          disabled={!qrDataUrl}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
        >
          <span>📄</span> QR 포함 안내문 PDF 다운로드
        </button>

        <AuthorCredit className="mt-8" />
      </main>
    </div>
  );
}
