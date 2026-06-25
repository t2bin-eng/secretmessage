import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME, APP_SUBTITLE, APP_VERSION, AUTHOR_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${APP_NAME} | ${APP_SUBTITLE}`,
  description: `${APP_SUBTITLE} - made by ${AUTHOR_NAME}`,
  authors: [{ name: AUTHOR_NAME }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
