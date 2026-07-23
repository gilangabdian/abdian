<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import gsap from "gsap";
import PhotoControls from "./PhotoControls.vue";
import { getAllPhotos } from "../../lib/api/PhotoApi";
import { useSWR } from "../../utils/useSWR";

const isSquareGrid = ref(false);
const selectedImage = ref(null);

const { data: photoSWR, isLoading: isSWRLoading, revalidate } = useSWR("cache_all_photos", getAllPhotos, []);
const photos = ref([]);
const isLoading = ref(true);

watch(
  isSWRLoading,
  async (newVal) => {
    if (!newVal) {
      photos.value = photoSWR.value;
      isLoading.value = false;
      NProgress.done();

      // Tunggu DOM selesai nge-render v-for
      await nextTick();

      if (photos.value && photos.value.length > 0) {
        gsap.fromTo(
          ".controls-container",
          { y: -10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        );
        gsap.fromTo(
          ".photo-item, .thank-you-msg",
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.05,
            clearProps: "all",
          },
        );
      }
    }
  },
  { immediate: true },
);

const openModal = (url) => {
  selectedImage.value = url;
};

const closeModal = () => {
  selectedImage.value = null;
};

onMounted(() => {
  // SWR handles load
});
</script>

<template>
  <div class="pt-28 md:pt-36 pb-16 min-h-screen">
    <!-- Static padding wrapper for headers/controls to prevent jumping -->
    <div class="max-w-7xl mx-auto px-4 pb-4 md:px-16 lg:px-7">
      <!-- Empty State -->
      <div v-if="!isLoading && photos.length === 0" class="text-center font-sans text-neutral-500 py-12">
        coming soon...
      </div>

      <!-- Controls (Floating Sticky) -->
      <PhotoControls v-if="!isLoading && photos.length > 0" v-model="isSquareGrid" />
    </div>

    <!-- Dynamic padding wrapper specifically for the gallery -->
    <div :class="['max-w-7xl mx-auto', isSquareGrid ? 'px-4 md:px-8 lg:px-8' : 'px-8 md:px-16 lg:px-16']">
      <!-- Gallery Grid (Row-based for vertical centering) -->
      <div
        v-if="!isLoading && photos.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="photo in photos"
          :key="photo.id"
          :class="[
            'photo-item bg-white flex items-center justify-center',
            isSquareGrid ? 'aspect-square overflow-hidden' : '',
          ]"
          style="opacity: 0; visibility: hidden"
          @click="openModal(photo.image_url)">
          <img
            :src="photo.image_url"
            alt="Photo"
            loading="lazy"
            :class="['w-full', isSquareGrid ? 'h-full object-cover' : 'h-auto']" />
        </div>
      </div>

      <!-- Thank You Message -->
      <div
        v-if="!isLoading && photos.length > 0"
        class="thank-you-msg mt-16 text-center text-neutral-500 font-sans text-sm tracking-wide"
        style="opacity: 0; visibility: hidden">
        thank you
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      @click="closeModal">
      <img loading="lazy" :src="selectedImage" class="w-full h-full object-contain" alt="Enlarged Photo" />
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
