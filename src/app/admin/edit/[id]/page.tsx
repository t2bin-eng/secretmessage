'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWorksheet, updateWorksheet } from '@/lib/storage';
import { Worksheet } from '@/types/worksheet';
import { APP_NAME } from '@/lib/constants';

export default function EditWorksheetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ws, setWs] = useState<Worksheet | null>(null);
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    const found = getWorksheet(id);
    if (!found) {
      alert('활동지를 찾을 수 없습니다.');
      router.push('/admin');
      return;
    }
    setWs(found);
    setTitle(found.title);
    setUnit(found.unit);
    setIsPublic(found.isPublic);
  }, [id, router]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    updateWorksheet(id, { title: title.trim(), unit: unit.trim(), isPublic });
    router.push('/admin');
  };

  if (!ws) return <div className="p-8 text-center text-gray-400">불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-indigo-200 text-sm hover:text-white">
            ← 목록으로
          </Link>
          <h1 className="text-xl font-bold mt-1">{APP_NAME}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">활동지 수정</h2>
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">고유번호: {ws.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">활동지 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">관련 단원</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">공개 여부</label>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isPublic ? '공개' : '비공개'}
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              저장
            </button>
            <Link
              href="/admin"
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-center"
            >
              취소
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
