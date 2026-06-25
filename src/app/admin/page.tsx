'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Worksheet } from '@/types/worksheet';
import { getAllWorksheets, deleteWorksheet, togglePublic } from '@/lib/storage';
import { APP_NAME, APP_SUBTITLE, APP_VERSION, AUTHOR_CREDIT } from '@/lib/constants';

export default function AdminPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWorksheets(getAllWorksheets());
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`"${title}" 활동지를 삭제하시겠습니까?`)) return;
    deleteWorksheet(id);
    setWorksheets(getAllWorksheets());
  };

  const handleTogglePublic = (id: string) => {
    togglePublic(id);
    setWorksheets(getAllWorksheets());
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">{APP_NAME}</h1>
          <p className="text-indigo-200 text-sm">{APP_SUBTITLE}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Action Row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">활동지 목록</h2>
          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <span className="text-lg">＋</span> 새 활동지 만들기
          </Link>
        </div>

        {worksheets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg">아직 만든 활동지가 없습니다.</p>
            <p className="text-sm mt-2">위 버튼을 눌러 첫 번째 활동지를 만들어보세요!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">고유번호</th>
                  <th className="px-4 py-3 text-left">제목</th>
                  <th className="px-4 py-3 text-left">단원</th>
                  <th className="px-4 py-3 text-center">크기</th>
                  <th className="px-4 py-3 text-center">단어수</th>
                  <th className="px-4 py-3 text-center">공개</th>
                  <th className="px-4 py-3 text-center">생성일</th>
                  <th className="px-4 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {worksheets.map((ws) => (
                  <tr key={ws.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-bold">
                      {ws.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{ws.title}</td>
                    <td className="px-4 py-3 text-gray-600">{ws.unit}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {ws.gridSize}×{ws.gridSize}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {ws.words.filter((w) => w.type === 'word').length}개
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublic(ws.id)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          ws.isPublic
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {ws.isPublic ? '공개' : '비공개'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                      {new Date(ws.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-center flex-wrap">
                        <Link
                          href={`/play/${ws.id}`}
                          target="_blank"
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          학생 화면
                        </Link>
                        <Link
                          href={`/admin/qr/${ws.id}`}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                        >
                          QR
                        </Link>
                        <Link
                          href={`/admin/edit/${ws.id}`}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                        >
                          수정
                        </Link>
                        <button
                          onClick={() => handleDelete(ws.id, ws.title)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center text-xs text-gray-400 border-t border-gray-200 mt-8">
        <span>
          {APP_NAME} v{APP_VERSION}
        </span>
        <span>{AUTHOR_CREDIT}</span>
      </footer>
    </div>
  );
}
