import { AUTHOR_CREDIT, APP_VERSION } from '@/lib/constants';

export default function AuthorCredit({ className = '' }: { className?: string }) {
  return (
    <p
      className={`text-right text-xs text-gray-400 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {AUTHOR_CREDIT} | v{APP_VERSION}
    </p>
  );
}
