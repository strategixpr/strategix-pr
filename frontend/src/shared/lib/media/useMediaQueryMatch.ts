import { onBeforeUnmount, onMounted, ref } from 'vue';

export const useMediaQueryMatch = (query: string, initialValue = false) => {
  const matches = ref(initialValue);
  let mediaQueryList: MediaQueryList | null = null;

  const syncMatchState = () => {
    if (!mediaQueryList) return;
    matches.value = mediaQueryList.matches;
  };

  const handleChange = () => {
    syncMatchState();
  };

  onMounted(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    mediaQueryList = window.matchMedia(query);
    syncMatchState();

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleChange);
      return;
    }

    mediaQueryList.addListener(handleChange);
  });

  onBeforeUnmount(() => {
    if (!mediaQueryList) return;

    if (typeof mediaQueryList.removeEventListener === 'function') {
      mediaQueryList.removeEventListener('change', handleChange);
    } else {
      mediaQueryList.removeListener(handleChange);
    }

    mediaQueryList = null;
  });

  return matches;
};
