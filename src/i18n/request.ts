import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';

const dictionaries: Record<string, Record<string, unknown>> = { en, fr };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale) {
    const cookieStore = await cookies();
    locale = cookieStore.get('NEXT_LOCALE')?.value;
  }

  if (!locale || !['en', 'fr'].includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: dictionaries[locale] || en,
  };
});


