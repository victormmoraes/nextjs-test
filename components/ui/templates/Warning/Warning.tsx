'use client';

import { usePathname } from 'next/navigation';
import { CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Warning() {
  const pathname = usePathname();
  const t = useTranslations('genai');

  const isPublicRoute = pathname.startsWith('/public');
  const warningMessage = isPublicRoute ? t('test_version_public') : t('test_version');

  return (
    <div className="w-full bg-gray-700 border-b border-gray-800 text-white">
      <div className="flex items-center px-6 py-2 min-h-[48px]">
        <span className="flex items-center justify-center rounded-full mr-3 bg-white/0 w-8 h-8 min-w-8 min-h-8">
          <CircleAlert className="w-5 h-5" />
        </span>
        <span className="text-sm font-medium">{warningMessage}</span>
      </div>
    </div>
  );
}
