import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { routing } from './routing';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export default getRequestConfig(async ({ requestLocale }) => {
  // First try to get locale from cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  let locale: string;

  if (cookieLocale && routing.locales.includes(cookieLocale as 'en' | 'pt-BR')) {
    // Use cookie locale if valid
    locale = cookieLocale;
  } else {
    // Fall back to requestLocale or default
    locale = await requestLocale || routing.defaultLocale;

    // Validate that the incoming locale is valid
    if (!routing.locales.includes(locale as 'en' | 'pt-BR')) {
      locale = routing.defaultLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
