'use client';

import { generateTemplate } from '@/lib/excel';

export default function ExcelTemplateButton() {
  const handleDownload = () => {
    const blob = generateTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '단어찾기_양식.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
    >
      <span>📥</span>
      엑셀 양식 다운로드
    </button>
  );
}
