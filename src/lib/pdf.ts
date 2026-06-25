'use client';

import { Worksheet } from '@/types/worksheet';
import { APP_NAME, APP_VERSION, AUTHOR_CREDIT } from './constants';

/**
 * Opens a print-friendly page in a new window.
 * Browsers will offer "Save as PDF" in the print dialog.
 */
export function printStudentWorksheet(ws: Worksheet) {
  const win = window.open('', '_blank');
  if (!win) return;

  const clueRows = ws.placedWords
    .filter((pw) => pw.type === 'word')
    .map(
      (pw, i) =>
        `<tr>
          <td style="padding:4px 8px;border:1px solid #ccc;text-align:center;font-weight:bold;">${i + 1}</td>
          <td style="padding:4px 8px;border:1px solid #ccc;">${pw.clue}</td>
          <td style="padding:4px 8px;border:1px solid #ccc;width:80px;border-bottom:1px solid #999;"></td>
        </tr>`
    )
    .join('');

  const gridRows = ws.grid
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="width:28px;height:28px;text-align:center;vertical-align:middle;border:1px solid #ccc;font-size:14px;font-weight:bold;">${cell}</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  win.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${ws.title} - 학생용</title>
<style>
  body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 20px; color: #000; }
  h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
  .meta { text-align: center; font-size: 13px; color: #555; margin-bottom: 12px; }
  .info-row { display: flex; gap: 40px; margin-bottom: 16px; }
  .info-box { border-bottom: 1px solid #000; min-width: 120px; padding: 2px 0; }
  table.grid { border-collapse: collapse; margin: 0 auto; }
  .clue-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  .secret-section { border: 2px dashed #888; padding: 12px; margin-top: 16px; }
  .credit { text-align: right; color: #aaa; font-size: 11px; margin-top: 24px; }
  @media print { body { margin: 10mm; } }
</style>
</head>
<body>
<p style="text-align:center;font-size:12px;color:#666;">${ws.unit}</p>
<h1>${ws.title}</h1>
<p class="meta">고유번호: ${ws.id} | ${APP_NAME}</p>
<div class="info-row">
  <div>학번: <span class="info-box">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
  <div>이름: <span class="info-box">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
</div>
<h3 style="font-size:14px;">📋 단어 설명 목록</h3>
<table class="clue-table">
  <thead><tr>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;">번호</th>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;">설명</th>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;">정답 단어</th>
  </tr></thead>
  <tbody>${clueRows}</tbody>
</table>
<h3 style="font-size:14px;text-align:center;">단어 찾기 퍼즐</h3>
<table class="grid">${gridRows}</table>
<div class="secret-section">
  <p style="margin:0 0 8px;font-weight:bold;">🔒 시크릿 메시지</p>
  <p style="font-size:12px;color:#666;margin:0 0 8px;">단어판에서 시크릿 메시지 조각을 모두 찾으면 메시지가 완성됩니다!</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    ${ws.secretWords.map(() => `<span style="display:inline-block;min-width:60px;border-bottom:2px solid #000;text-align:center;padding:4px;font-size:16px;">???</span>`).join('')}
  </div>
</div>
<p class="credit">${AUTHOR_CREDIT} | v${APP_VERSION}</p>
</body></html>`);

  win.document.close();
  win.print();
}

export function printTeacherAnswerKey(ws: Worksheet) {
  const win = window.open('', '_blank');
  if (!win) return;

  const colors = [
    '#FFEAA7','#A8E6CF','#DDA0DD','#87CEEB','#F0E68C',
    '#FFB6C1','#98FB98','#DEB887','#F4A460','#B0C4DE',
  ];

  const clueRows = ws.placedWords
    .filter((pw) => pw.type === 'word')
    .map(
      (pw, i) =>
        `<tr>
          <td style="padding:4px 8px;border:1px solid #ccc;text-align:center;">${i + 1}</td>
          <td style="padding:4px 8px;border:1px solid #ccc;">${pw.clue}</td>
          <td style="padding:4px 8px;border:1px solid #ccc;font-weight:bold;color:#c00;">${pw.word}</td>
          <td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;">${pw.direction} (${pw.startRow + 1},${pw.startCol + 1})</td>
        </tr>`
    )
    .join('');

  const secretRows = ws.placedWords
    .filter((pw) => pw.type === 'secret')
    .map(
      (pw, i) =>
        `<tr>
          <td style="padding:4px 8px;border:1px solid #ccc;text-align:center;">${i + 1}</td>
          <td style="padding:4px 8px;border:1px solid #ccc;font-weight:bold;color:#a00;">${pw.word}</td>
          <td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;">${pw.direction} (${pw.startRow + 1},${pw.startCol + 1})</td>
        </tr>`
    )
    .join('');

  // Build position map for highlighting
  const positionMap: Record<string, { colorIdx: number; type: 'word' | 'secret' }> = {};
  ws.placedWords.forEach((pw, pwIdx) => {
    pw.positions.forEach((p) => {
      positionMap[`${p.row},${p.col}`] = {
        colorIdx: pwIdx % colors.length,
        type: pw.type,
      };
    });
  });

  const gridRows = ws.grid
    .map((row, r) =>
      `<tr>${row
        .map((cell, c) => {
          const key = `${r},${c}`;
          const info = positionMap[key];
          const bg = info
            ? info.type === 'secret'
              ? '#FFD700'
              : colors[info.colorIdx]
            : '#fff';
          return `<td style="width:28px;height:28px;text-align:center;vertical-align:middle;border:1px solid #ccc;font-size:14px;font-weight:bold;background:${bg};">${cell}</td>`;
        })
        .join('')}</tr>`
    )
    .join('');

  win.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${ws.title} - 교사용 정답지</title>
<style>
  body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 20px; color: #000; }
  h1 { text-align: center; font-size: 20px; }
  table.grid { border-collapse: collapse; margin: 0 auto; }
  .answer-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  .credit { text-align: right; color: #aaa; font-size: 11px; margin-top: 24px; }
  @media print { body { margin: 10mm; } }
</style>
</head>
<body>
<h1>🔑 교사용 정답지 - ${ws.title}</h1>
<p style="text-align:center;font-size:13px;color:#666;">${ws.unit} | ${ws.id} | 시크릿 메시지: ${ws.secretMessage || '없음'}</p>
<h3>정답 단어 목록</h3>
<table class="answer-table">
  <thead><tr>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;">번호</th>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;">설명</th>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;">정답</th>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#f5f5f5;">위치/방향</th>
  </tr></thead>
  <tbody>${clueRows}</tbody>
</table>
${secretRows ? `<h3>시크릿 메시지 단어</h3>
<table class="answer-table">
  <thead><tr>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#fff3cd;">번호</th>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#fff3cd;">단어</th>
    <th style="border:1px solid #ccc;padding:4px 8px;background:#fff3cd;">위치/방향</th>
  </tr></thead>
  <tbody>${secretRows}</tbody>
</table>` : ''}
<h3 style="text-align:center;">정답 단어판</h3>
<table class="grid">${gridRows}</table>
<p style="text-align:center;font-size:11px;margin-top:8px;color:#666;">노란색(금색) = 시크릿 메시지 조각</p>
<p class="credit">${AUTHOR_CREDIT} | v${APP_VERSION}</p>
</body></html>`);

  win.document.close();
  win.print();
}

export function printQRGuide(ws: Worksheet, qrDataUrl: string, baseUrl: string) {
  const win = window.open('', '_blank');
  if (!win) return;

  const studentUrl = `${baseUrl}/play/${ws.id}`;

  win.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>QR 안내문 - ${ws.title}</title>
<style>
  body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 40px; text-align: center; color: #000; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .unit { font-size: 14px; color: #666; margin-bottom: 20px; }
  .id { font-size: 13px; color: #888; margin-bottom: 24px; }
  img { width: 200px; height: 200px; margin: 20px auto; display: block; }
  .url { font-size: 13px; word-break: break-all; margin: 16px auto; max-width: 400px; color: #333; }
  .guide { font-size: 15px; margin: 20px 0; color: #444; }
  .credit { text-align: right; color: #aaa; font-size: 11px; margin-top: 40px; }
  @media print { body { margin: 20mm; } }
</style>
</head>
<body>
<h1>${ws.title}</h1>
<p class="unit">${ws.unit}</p>
<p class="id">활동지 번호: ${ws.id}</p>
<img src="${qrDataUrl}" alt="QR Code" />
<p class="url">🔗 ${studentUrl}</p>
<p class="guide">QR을 스캔하거나 URL로 접속해 활동을 시작하세요.</p>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
<p style="font-size:12px;color:#999;">제작: ${AUTHOR_CREDIT} | ${APP_NAME} v${APP_VERSION}</p>
<p class="credit">${AUTHOR_CREDIT}</p>
</body></html>`);

  win.document.close();
  win.print();
}
