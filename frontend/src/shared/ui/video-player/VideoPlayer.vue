<script setup lang="ts">
import videoPlaceholder from '@/assets/images/video-placeholder.svg'
import { removeAutoplayCandidate, subscribeAutoplayOwner, upsertAutoplayCandidate } from '@/shared/lib/media/autoplayCoordinator';
const props = withDefaults(
  defineProps<{
    src: string;
    autoplay?: boolean;
    hideControls?: boolean;
    loadMargin?: number;
    coordinatedAutoplay?: boolean;
  }>(),
  {
    autoplay: false,
    hideControls: false,
    loadMargin: 320,
    coordinatedAutoplay: true,
  },
);

const { app } = useRuntimeConfig();
const baseURL = app?.baseURL ?? '/';
const VIEWPORT_MARGIN = 320;
const isClient = typeof window !== 'undefined';

const normalizeBase = (base: string) => {
  if (!base || base === '/') return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const resolvedSrc = computed(() => {
  const raw = props.src?.trim() ?? '';
  if (!raw) return '';

  // Keep full URLs and browser-generated sources untouched.
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }

  const base = normalizeBase(baseURL);
  if (!base) {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }

  if (raw === base || raw.startsWith(`${base}/`)) {
    return raw;
  }

  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
});

const videoElement = ref<HTMLVideoElement | null>(null);
const playerElement = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const isMuted = ref(Boolean(props.autoplay));
const isMediaHovered = ref(false);
const showPlaceholder = ref(false);
const isInViewport = ref(false);
const viewportIntersectionRatio = ref(0);
const isNearViewport = ref(false);
const isPageVisible = ref(true);
const hasLoadedOnce = ref(false);
const isAutoplayOwner = ref(false);
let unsubscribeAutoplayOwner: (() => void) | null = null;
let viewportObserver: IntersectionObserver | null = null;
let nearViewportObserver: IntersectionObserver | null = null;

const createAutoplayInstanceId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `video-player-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

const autoplayInstanceId = createAutoplayInstanceId();

const shouldAutoplay = computed(() => Boolean(props.autoplay));
const shouldHideControls = computed(() => Boolean(props.hideControls));
const shouldCoordinateAutoplay = computed(() => Boolean(props.coordinatedAutoplay));
const videoButtonLabel = computed(() => (isPlaying.value ? 'Pause video' : 'Play video'));
const soundButtonLabel = computed(() => (isMuted.value ? 'Enable sound' : 'Disable sound'));
const showPlayButton = computed(() => !isPlaying.value || isMediaHovered.value);
const canAutoplayNow = computed(() => (
  shouldAutoplay.value
  && (!shouldCoordinateAutoplay.value || isAutoplayOwner.value)
  && isInViewport.value
  && isPageVisible.value
));
const effectiveSrc = computed(() => (
  showPlaceholder.value
    ? ''
    : (
      shouldAutoplay.value
        ? ((isNearViewport.value || hasLoadedOnce.value) ? resolvedSrc.value : '')
        : resolvedSrc.value
    )
));
const videoPreload = computed(() => (
  shouldAutoplay.value && !isNearViewport.value && !hasLoadedOnce.value
    ? 'none'
    : 'metadata'
));
const viewportLoadMargin = computed(() => (
  Number.isFinite(props.loadMargin) && props.loadMargin >= 0
    ? props.loadMargin
    : VIEWPORT_MARGIN
));
const autoplayCandidateScore = computed(() => {
  if (!shouldAutoplay.value) return 0;
  if (!shouldCoordinateAutoplay.value) return 0;
  if (!isPageVisible.value || !isInViewport.value) return 0;
  if (!resolvedSrc.value || showPlaceholder.value) return 0;

  return Math.max(viewportIntersectionRatio.value, 0.0001);
});

const syncPlayingState = () => {
  const video = videoElement.value;
  isPlaying.value = Boolean(video && !video.paused && !video.ended);
};

const syncMutedState = () => {
  const video = videoElement.value;
  if (!video) return;
  isMuted.value = video.muted;
};

const playVideo = async () => {
  const video = videoElement.value;
  if (!video || !effectiveSrc.value) return;

  video.muted = isMuted.value;

  try {
    await video.play();
    syncPlayingState();
  } catch {
    isPlaying.value = false;
  }
};

const toggleVideoPlayback = async () => {
  const video = videoElement.value;
  if (!video || !effectiveSrc.value) return;

  if (video.paused || video.ended) {
    await playVideo();
    return;
  }

  video.pause();
  syncPlayingState();
};

const toggleVideoSound = () => {
  const video = videoElement.value;
  if (!video) return;

  video.muted = !video.muted;
  syncMutedState();
};

const pauseVideo = () => {
  const video = videoElement.value;
  if (!video) return;
  video.pause();
  syncPlayingState();
};

const handleVisibilityChange = () => {
  if (typeof document === 'undefined') {
    isPageVisible.value = true;
    return;
  }

  isPageVisible.value = !document.hidden;
};

const syncPlaybackByState = async () => {
  const video = videoElement.value;
  if (!video) return;

  if (!effectiveSrc.value) {
    pauseVideo();
    return;
  }

  if (canAutoplayNow.value) {
    await playVideo();
    return;
  }

  if (shouldAutoplay.value && !video.paused) {
    pauseVideo();
    if (!isNearViewport.value) {
      try {
        video.currentTime = 0;
      } catch {
        // Ignore seek errors for streams that cannot seek yet.
      }
    }
    return;
  }

  syncPlayingState();
};

watch(
  () => [resolvedSrc.value, shouldAutoplay.value],
  async () => {
    isPlaying.value = false;
    isMuted.value = shouldAutoplay.value;
    showPlaceholder.value = false;
    hasLoadedOnce.value = !shouldAutoplay.value;
    await nextTick();

    if (videoElement.value) {
      videoElement.value.muted = isMuted.value;
    }

    await syncPlaybackByState();
  },
  { immediate: true },
);

watch(
  () => autoplayCandidateScore.value,
  (score) => {
    if (!isClient || !shouldCoordinateAutoplay.value) {
      removeAutoplayCandidate(autoplayInstanceId);
      return;
    }

    if (score > 0) {
      upsertAutoplayCandidate(autoplayInstanceId, score);
      return;
    }

    removeAutoplayCandidate(autoplayInstanceId);
  },
  { immediate: true },
);

watch(
  () => [isAutoplayOwner.value, isInViewport.value, isNearViewport.value, isPageVisible.value],
  () => {
    if (isNearViewport.value && resolvedSrc.value) {
      hasLoadedOnce.value = true;
    }
    void syncPlaybackByState();
  },
);

onMounted(() => {
  if (isClient && shouldCoordinateAutoplay.value) {
    unsubscribeAutoplayOwner = subscribeAutoplayOwner((ownerId) => {
      isAutoplayOwner.value = ownerId === autoplayInstanceId;
    });
  }

  handleVisibilityChange();
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    isInViewport.value = true;
    isNearViewport.value = true;
    viewportIntersectionRatio.value = 1;
    return;
  }

  viewportObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      const isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
      isInViewport.value = isVisible;
      viewportIntersectionRatio.value = isVisible ? entry.intersectionRatio : 0;
    },
    {
      threshold: [0, 0.01, 0.05, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
      rootMargin: '0px',
    },
  );

  nearViewportObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      isNearViewport.value = entry.isIntersecting && entry.intersectionRatio > 0;
    },
    {
      threshold: [0, 0.01],
      rootMargin: `${viewportLoadMargin.value}px 0px ${viewportLoadMargin.value}px 0px`,
    },
  );

  if (playerElement.value) {
    viewportObserver.observe(playerElement.value);
    nearViewportObserver.observe(playerElement.value);
  }
});

onBeforeUnmount(() => {
  if (isClient) {
    removeAutoplayCandidate(autoplayInstanceId);
  }

  if (unsubscribeAutoplayOwner) {
    unsubscribeAutoplayOwner();
    unsubscribeAutoplayOwner = null;
  }

  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }

  if (viewportObserver) {
    viewportObserver.disconnect();
    viewportObserver = null;
  }

  if (nearViewportObserver) {
    nearViewportObserver.disconnect();
    nearViewportObserver = null;
  }

  const video = videoElement.value;
  if (!video) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
});
</script>

<template>
  <div
    ref="playerElement"
    class="video-player"
    @mouseenter="isMediaHovered = true"
    @mouseleave="isMediaHovered = false"
  >
    <video
      v-if="!showPlaceholder"
      ref="videoElement"
      class="video-player__video"
      :src="effectiveSrc || undefined"
      :autoplay="canAutoplayNow"
      :muted="isMuted"
      playsinline
      :preload="videoPreload"
      loop
      @canplay="syncPlaybackByState"
      @play="syncPlayingState"
      @pause="syncPlayingState"
      @volumechange="syncMutedState"
      @ended="syncPlayingState"
      @error="showPlaceholder = true"
    />
    <img
      v-else
      :src="videoPlaceholder"
      class="video-player__placeholder"
      alt="Video placeholder"
    >
    <button
      v-if="!shouldHideControls && showPlayButton && !showPlaceholder"
      type="button"
      class="media-control play-button"
      :aria-label="videoButtonLabel"
      @click="toggleVideoPlayback"
    >
      <svg
        v-if="isPlaying"
        class="media-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect
          x="6.5"
          y="5"
          width="3.5"
          height="14"
          rx="1.2"
          fill="currentColor"
        />
        <rect
          x="14"
          y="5"
          width="3.5"
          height="14"
          rx="1.2"
          fill="currentColor"
        />
      </svg>
      <svg
        v-else
        class="media-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M8 5v14l11-7z"
          fill="currentColor"
        />
      </svg>
    </button>
    <button
      v-if="!shouldHideControls && !showPlaceholder"
      type="button"
      class="media-control sound-button"
      :aria-label="soundButtonLabel"
      :aria-pressed="!isMuted"
      @click="toggleVideoSound"
    >
      <svg
        v-if="isMuted"
        class="media-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 5L6 9H3v6h3l5 4V5z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <path
          d="M16 9l5 6M21 9l-5 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <svg
        v-else
        class="media-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 5L6 9H3v6h3l5 4V5z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <path
          d="M15.5 8.5a5 5 0 0 1 0 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M18.5 6a9 9 0 0 1 0 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.video-player{
  width: 100%;
  position: relative;
}

.video-player__video{
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
  display: block;
}

.video-player__placeholder{
  width: 100%;
  height: auto;
  object-fit: cover;
  object-position: center;
  display: block;

  @media(max-aspect-ratio: 3/5){
    aspect-ratio: 390 / 185;
  }

  @media(min-aspect-ratio: 4/5){
    aspect-ratio: 1200 / 323;
  }

  @media(--pc-width) {
    padding-inline: var(--padding-section-x);
    box-sizing: border-box;
    max-height: 75%;
    aspect-ratio: 1200 / 572;
  }

  @media(--mobile-medium) {
    max-height: 75%;
  }
}

.media-control{
  border: 0;
  background-color: transparent;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(46px, 4.5vw, 66px);
  height: clamp(46px, 4.5vw, 66px);
  border-radius: 999px;
  mix-blend-mode: difference;
  z-index: 1;
  line-height: 1;
  transform: var(--control-transform);
  transition: color 0.2s ease, transform 0.2s ease, mix-blend-mode 0.2s ease;
}

.media-control:hover{
  transform: var(--control-transform) scale(1.06);
  color: var(--strategix-accent);
  mix-blend-mode: normal;
}

.media-control:focus-visible{
  outline: none;
  transform: var(--control-transform) scale(1.06);
  color: var(--strategix-accent);
  mix-blend-mode: normal;
}

.media-icon{
  width: clamp(60px, 5.7vw, 84px);
  height: clamp(60px, 5.7vw, 84px);
}

.play-button{
  position: absolute;
  left: 50%;
  top: 50%;
  width: clamp(58px, 5.5vw, 84px);
  height: clamp(58px, 5.5vw, 84px);
  --control-transform: translate(-50%, -50%);
}

.sound-button{
  position: absolute;
  left: 50%;
  --control-transform: translateX(-50%);
  bottom: clamp(2px, 0.4vw, 8px);
}

@media(--pc-width) {
  .sound-button{
    bottom: clamp(4px, 0.5vw, 10px);
  }
}
</style>
