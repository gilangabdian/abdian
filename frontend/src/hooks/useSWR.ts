import { useState, useEffect, useCallback } from 'react';

/**
 * useSWR - Stale-While-Revalidate untuk React (Instan & Selalu Update)
 * @param {string} cacheKey - Kunci unik untuk LocalStorage
 * @param {function} fetcher - Fungsi async yang mereturn response API
 * @param {any} initialData - Nilai awal (default: null atau [])
 * @returns { data, isLoading, error, revalidate }
 */
export function useSWR<T>(cacheKey: string, fetcher: () => Promise<Response>, initialData: T | null = null) {
  const [data, setData] = useState<T | null>(() => {
    if (typeof window === 'undefined') return initialData;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error("Gagal membaca cache:", e);
    }
    return initialData;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(cacheKey) ? false : true; // Jika ada cache, langsung tampil (0 detik)
  });
  
  const [error, setError] = useState<Error | null>(null);

  const revalidate = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem(cacheKey)) {
        setIsLoading(true);
      }

      const response = await fetcher();
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const responseData = await response.json();
      const freshData = responseData.data !== undefined ? responseData.data : responseData;
      
      const freshString = JSON.stringify(freshData);
      
      if (typeof window !== 'undefined') {
        const oldString = localStorage.getItem(cacheKey);
        
        // Update reaktif HANYA jika data benar-benar berubah
        if (freshString !== oldString) {
          setData(freshData);
          localStorage.setItem(cacheKey, freshString);
        }
      } else {
        setData(freshData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`SWR Error [${cacheKey}]:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, fetcher]);

  // 1. Jalankan revalidasi di latar belakang saat komponen pertama kali dirender
  useEffect(() => {
    revalidate();
  }, [revalidate]);

  // 2. Revalidate on Window Focus: Fetch ulang kalau user balik ke tab ini
  useEffect(() => {
    const onFocus = () => {
      revalidate();
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [revalidate]);

  return { data, isLoading, error, revalidate };
}
