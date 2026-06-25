'use client';

import { useRef, useState } from 'react';
import { parseExcel, ParseResult } from '@/lib/excel';

interface Props {
  onParsed: (result: ParseResult) => void;
}

export default function ExcelUploader({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const result = parseExcel(buffer);
    if (!result.success) {
      setError(result.errors.join(' / '));
    }
    onParsed(result);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <p className="text-4xl mb-2">📂</p>
        {fileName ? (
          <p className="text-sm font-medium text-blue-700">{fileName}</p>
        ) : (
          <p className="text-sm text-gray-500">
            엑셀 파일을 여기에 끌어다 놓거나 클릭하여 선택하세요
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">.xlsx 파일만 지원</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleChange}
        className="hidden"
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}
    </div>
  );
}
