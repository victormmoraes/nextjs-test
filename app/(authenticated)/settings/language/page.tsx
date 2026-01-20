'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/molecules/Card';
import { useAuth } from '@/contexts/AuthContext';
import type { Locale } from '@/i18n/routing';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Language Settings Page
 *
 * Allows users to change the application language.
 * Available languages:
 * - Portuguese (Brazil) - pt-BR
 * - English (US) - en
 *
 * Note: Vibra tenant users (tenantId === 3) are redirected away
 * as they cannot access language settings.
 */
export default function LanguagePage() {
  const t = useTranslations();
  const router = useRouter();
  const currentLocale = useLocale();
  const { user } = useAuth();

  // Redirect Vibra users (tenantId === 3) - they cannot access language settings
  useEffect(() => {
    if (user?.tenantId === 3) {
      router.replace('/last-updates');
    }
  }, [user, router]);

  const selectLanguage = (locale: Locale) => {
    if (locale === currentLocale) return;

    // Set the NEXT_LOCALE cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year

    // Full page reload to apply the new locale
    window.location.reload();
  };

  // Don't render for Vibra users
  if (user?.tenantId === 3) {
    return null;
  }

  return (
    <div className="p-2">
      <Card>
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-200">
          {t('language.title')}
        </h2>

        {/* Description */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('language.description')}
          </p>
        </div>

        {/* Language Options */}
        <div className="space-y-4">
          {/* Portuguese */}
          <button
            type="button"
            onClick={() => selectLanguage('pt-BR')}
            className={cn(
              'w-full flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all text-left',
              currentLocale === 'pt-BR'
                ? 'border-primary-800 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div>
              <p className="font-medium text-gray-900">Português (Brasil)</p>
              <p className="text-sm text-gray-500">Portuguese (Brazil)</p>
            </div>
            {currentLocale === 'pt-BR' && (
              <Check className="w-5 h-5 text-primary-800" />
            )}
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => selectLanguage('en')}
            className={cn(
              'w-full flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all text-left',
              currentLocale === 'en'
                ? 'border-primary-800 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div>
              <p className="font-medium text-gray-900">English (US)</p>
              <p className="text-sm text-gray-500">Inglês (EUA)</p>
            </div>
            {currentLocale === 'en' && (
              <Check className="w-5 h-5 text-primary-800" />
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}
