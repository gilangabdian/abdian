import { ref, onMounted, onUnmounted } from 'vue';

/**
 * useSWR - Stale-While-Revalidate untuk Vue 3 (Instan & Selalu Update)
 * @param {string} cacheKey - Kunci unik untuk LocalStorage
 * @param {function} fetcher - Fungsi async yang mereturn response API
 * @param {any} initialData - Nilai awal (default: null atau [])
 * @returns { data, isLoading, error, revalidate }
 */
export function useSWR(cacheKey, fetcher, initialData = null) {
  const data = ref(initialData);
  const isLoading = ref(true);
  const error = ref(null);

  let isCached = false;

  try {
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      data.value = JSON.parse(cached);
      isLoading.value = false; // Jika ada cache, langsung tampil (0 detik)
      isCached = true;
    }
  } catch (e) {
    console.error("Gagal membaca cache:", e);
  }

  const revalidate = async () => {
    try {
      if (!isCached) isLoading.value = true;

      const response = await fetcher();
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const responseData = await response.json();
      const freshData = responseData.data !== undefined ? responseData.data : responseData;
      
      const freshString = JSON.stringify(freshData);
      const oldString = localStorage.getItem(cacheKey);
      
      // Update reaktif HANYA jika data benar-benar berubah
      if (freshString !== oldString) {
        data.value = freshData;
        localStorage.setItem(cacheKey, freshString);
      }
    } catch (err) {
      error.value = err;
      console.error(`SWR Error [${cacheKey}]:`, err);
    } finally {
      isLoading.value = false;
    }
  };

  // 1. Jalankan revalidasi di latar belakang saat komponen pertama kali dirender
  revalidate();

  // 2. Revalidate on Window Focus: Fetch ulang kalau user balik ke tab ini
  const onFocus = () => {
    revalidate();
  };

  onMounted(() => {
    window.addEventListener('focus', onFocus);
  });

  onUnmounted(() => {
    window.removeEventListener('focus', onFocus);
  });

  return { data, isLoading, error, revalidate };
}
