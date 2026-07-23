<script setup>
import { onMounted, nextTick, ref, computed, watch } from "vue";
import { Icon } from "@iconify/vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  skills: {
    type: Array,
    required: true,
    default: () => [],
  },
  profile: {
    type: Object,
    default: null,
  },
});

const hiddenCategories = computed(() => props.profile?.about?.hidden_skill_categories || []);

// Priority:
// 1. If activeCategory is already set (by user click), use it.
// 2. Otherwise use default_skill_category if it exists.
// 3. Otherwise "All" (null).
const activeCategory = ref(null);
const isVisible = ref(false);
const isUserChanged = ref(false);

const handleCategoryClick = (cat) => {
  activeCategory.value = cat;
  isUserChanged.value = true;
};

watch(
  () => props.profile,
  (newProfile) => {
    if (newProfile && !isUserChanged.value) {
      if (newProfile.about?.default_skill_category) {
        activeCategory.value = newProfile.about.default_skill_category;
      } else if (categories.value.length > 0) {
        activeCategory.value = categories.value[0];
      }
    }
  },
  { immediate: true },
);

const categories = computed(() => {
  const cats = new Set(props.skills.map((s) => s.category || "Frontend"));
  const uniqueCats = Array.from(cats);

  const visibleCats = uniqueCats.filter((cat) => !hiddenCategories.value.includes(cat));

  const customOrder = props.profile?.about?.skill_categories_order || [];

  visibleCats.sort((a, b) => {
    const indexA = customOrder.indexOf(a);
    const indexB = customOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return visibleCats;
});

const filteredSkills = computed(() => {
  const activeSkills = props.skills.filter((s) => s.is_active_on_home !== 0 && s.is_active_on_home !== false);

  if (!activeCategory.value) return activeSkills;
  return activeSkills.filter((s) => (s.category || "Frontend") === activeCategory.value);
});

const setCategory = (cat) => {
  handleCategoryClick(cat);
};

// Rotasi acak
const getRotationClass = (index) => {
  const rotations = ["rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1", "-rotate-3", "rotate-0"];
  return rotations[index % rotations.length];
};

// Posisi vertikal acak
const getTranslateClass = (index) => {
  const translates = ["translate-y-0", "translate-y-2", "translate-y-0", "-translate-y-2"];
  return translates[index % translates.length];
};

onMounted(async () => {
  await nextTick();

  // Animasi Header
  gsap.set(".header-animate", { y: 50, opacity: 0 });
  gsap.to(".header-animate", {
    scrollTrigger: {
      trigger: ".header-section",
      start: "top 80%",
      once: true,
    },
    y: 0,
    opacity: 1,
    duration: 1,
    stagger: 0.2,
    ease: "power3.out",
  });

  // Animasi Tabs (Pills)
  gsap.set(".tab-pill", { scale: 0.8, opacity: 0 });
  gsap.to(".tab-pill", {
    scrollTrigger: {
      trigger: ".tabs-section",
      start: "top 85%",
      once: true,
    },
    scale: 1,
    opacity: 1,
    duration: 0.8,
    stagger: 0.1,
    ease: "back.out(1.5)",
  });

  // Trigger untuk mulai merender Cards
  ScrollTrigger.create({
    trigger: ".cards-section",
    start: "top 85%",
    once: true,
    onEnter: () => {
      isVisible.value = true;
    },
  });
});

// Refresh ScrollTrigger saat kategori berubah agar section di bawahnya tidak kacau
watch(activeCategory, () => {
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 1000);
});

// GSAP Hooks untuk TransitionGroup
const onEnter = (el, done) => {
  const index = el.dataset.index || 0;
  gsap.fromTo(
    el,
    { opacity: 0, y: 100, scale: 0.8 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: "elastic.out(1, 0.75)",
      delay: index * 0.05, // Stagger effect based on index
      onComplete: done,
    },
  );
};

const onLeave = (el, done) => {
  // Fix position so it doesn't break layout while leaving
  const { width, height } = el.getBoundingClientRect();
  gsap.set(el, { position: "absolute", width, height, zIndex: -1 });

  gsap.to(el, {
    opacity: 0,
    scale: 0.5,
    y: -50,
    duration: 0.4,
    ease: "power2.in",
    onComplete: done,
  });
};
</script>

<template>
  <section class="py-24 px-4 md:px-10 bg-white overflow-hidden min-h-screen relative">
    <div class="max-w-6xl mx-auto">
      <div class="header-section text-center mb-10 max-w-3xl mx-auto">
        <h2
          class="header-animate text-4xl font-black text-black mb-6 font-serif tracking-wider inline-block relative border-b border-black/20 pb-2">
          <span class="relative z-10">Tech Stack</span>
        </h2>
      </div>

      <!-- FILTER TABS -->
      <div
        class="tabs-section flex md:flex-wrap overflow-x-auto hide-scrollbar justify-center md:justify-center gap-3 mb-16 pt-16 pb-2 snap-x -mt-16">
        <div
          v-for="cat in categories"
          :key="cat"
          class="shrink-0 snap-center flex items-center justify-center relative hover:z-50">
          <button
            @click="setCategory(cat)"
            class="tab-pill px-5 py-2 rounded-full font-mono text-xs md:text-sm uppercase font-bold transition-all duration-300 flex items-center gap-2"
            :class="
              activeCategory === cat
                ? 'bg-black dark:bg-white dark:text-black text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-100/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white'
            ">
            {{ cat }}

            <div class="relative group flex items-center justify-center hidden md:flex">
              <Icon icon="lucide:info" class="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              <!-- Tooltip -->
              <div
                v-if="profile?.about?.skill_categories_info && profile.about.skill_categories_info[cat]"
                class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-neutral-700 dark:bg-neutral-400 text-white dark:text-black text-[10px] md:text-xs px-3 py-1.5 rounded-md font-sans opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-50 shadow-xl text-center leading-tight normal-case cursor-default">
                {{ profile.about.skill_categories_info[cat] }}
                <div
                  class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-700 dark:bg-neutral-400 rotate-45"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- CARDS LIST -->
      <div class="cards-section min-h-[400px] relative">
        <TransitionGroup
          tag="div"
          class="flex flex-wrap justify-center gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16 p-4"
          @enter="onEnter"
          @leave="onLeave"
          :css="false">
          <template v-if="isVisible">
            <div
              v-for="(skill, index) in filteredSkills"
              :key="skill.id"
              :data-index="index"
              class="polaroid-card relative group w-[45%] md:w-[28%] lg:w-[16%] max-w-[180px]"
              :class="[getRotationClass(index), getTranslateClass(index)]">
              <div
                class="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-100 rounded-full z-20 shadow-sm border border-gray-600"></div>

              <div
                class="bg-white p-3 pb-8 border border-black/20 shadow-sm transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-md hover:rotate-0 cursor-default rounded-sm relative">
                <div
                  class="aspect-square bg-gray-50 border border-black/10 mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors rounded-sm">
                  <Icon :icon="skill.identifier" class="w-12 h-12 md:w-14 md:h-14 text-black relative z-10" />

                  <!-- Minimalist Note Badge -->
                  <div v-if="skill.note" class="absolute bottom-1 right-1 z-20">
                    <span
                      class="text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700/90 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm text-[8px] md:text-[9px] font-mono px-1.5 py-0.5 rounded-sm">
                      {{ skill.note }}
                    </span>
                  </div>
                </div>

                <div class="text-center">
                  <span
                    class="font-serif font-bold text-black text-xs md:text-sm uppercase tracking-widest border-b border-transparent group-hover:border-black/20 transition-all pb-1">
                    {{ skill.name }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </TransitionGroup>

        <!-- Empty State (Optional) -->
        <div v-if="isVisible && filteredSkills.length === 0" class="absolute inset-0 flex items-center justify-center">
          <p class="font-mono text-gray-400 font-bold uppercase">No skills found in this category.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.header-animate,
.tab-pill {
  will-change: transform, opacity;
}
.polaroid-card {
  will-change: transform, opacity;
}
</style>
<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
