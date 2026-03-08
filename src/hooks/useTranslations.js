import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Cache translations in memory across component mounts (keyed by page+language)
const cache = {};

/**
 * Fetches active localization keys for a given page and language.
 * Returns a t(key, fallback) function — falls back to the provided default
 * string if the key is not yet loaded or doesn't exist in the DB.
 *
 * Usage:
 *   const t = useTranslations('landing', 'en');
 *   <h1>{t('hero.title', 'Default headline')}</h1>
 */
export function useTranslations(page = 'landing', language = 'en') {
  const cacheKey = `${page}:${language}`;
  const [translations, setTranslations] = useState(cache[cacheKey] ?? {});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (cache[cacheKey] && Object.keys(cache[cacheKey]).length > 0) {
      setTranslations(cache[cacheKey]);
      return;
    }

    const baseURL = import.meta.env.VITE_API_URL || '';
    axios
      .get(`${baseURL}/api/localization`, { params: { page, language } })
      .then((res) => {
        const data = res.data.translations ?? {};
        cache[cacheKey] = data;
        if (mounted.current) setTranslations(data);
      })
      .catch(() => {
        // Silently fall back to hardcoded defaults — no disruption to public page
      });

    return () => { mounted.current = false; };
  }, [page, language, cacheKey]);

  return (key, fallback = '') => translations[key] ?? fallback;
}
