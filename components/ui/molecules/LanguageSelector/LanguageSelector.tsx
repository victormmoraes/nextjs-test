'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Language = 'pt-BR' | 'en';

export function LanguageSelector() {
  const currentLang = useLocale() as Language;
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (lang: Language) => {
    // Remove the current locale prefix from pathname if it exists
    const segments = pathname.split('/');
    const currentLocaleIndex = segments.findIndex((s) => s === 'pt-BR' || s === 'en');

    if (currentLocaleIndex !== -1) {
      segments[currentLocaleIndex] = lang;
    } else {
      segments.splice(1, 0, lang);
    }

    const newPathname = segments.join('/') || '/';
    router.push(newPathname);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLanguage('pt-BR')}
        className={cn(
          'text-sm cursor-pointer hover:text-primary-600 transition-colors',
          currentLang === 'pt-BR' ? 'font-semibold text-primary-800' : 'text-gray-600'
        )}
      >
        PT
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => switchLanguage('en')}
        className={cn(
          'text-sm cursor-pointer hover:text-primary-600 transition-colors',
          currentLang === 'en' ? 'font-semibold text-primary-800' : 'text-gray-600'
        )}
      >
        EN
      </button>
    </div>
  );
}
