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
});

const activeCategory = ref("Frontend");
const isVisible = ref(false);

const predefinedOrder = ["Frontend", "Backend", "Mobile", "Cloud & DevOps", "Databases"];

const categories = computed(() => {
  const cats = new Set(props.skills.map((s) => s.category || "Frontend"));
  const uniqueCats = Array.from(cats);

  uniqueCats.sort((a, b) => {
    const indexA = predefinedOrder.indexOf(a);
    const indexB = predefinedOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  return ["All", ...uniqueCats];
});

const filteredSkills = computed(() => {
  if (activeCategory.value === "All") return props.skills;
  return props.skills.filter((s) => (s.category || "Frontend") === activeCategory.value);
});

const setCategory = (cat) => {
  activeCategory.value = cat;
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

        <p
          class="header-animate mt-4 font-sans text-gray-700 text-sm md:text-base lowercase tracking-tight leading-relaxed">
          here are the tools and technologies I work with. My current stack is centered around modern front-end
          frameworks to help me build clean, responsive, and functional web interfaces.
        </p>
      </div>

      <!-- FILTER TABS -->
      <div
        class="tabs-section flex md:flex-wrap overflow-x-auto hide-scrollbar justify-start md:justify-center gap-3 mb-16 pb-2 snap-x">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="setCategory(cat)"
          class="tab-pill shrink-0 snap-center px-5 py-2 rounded-full font-mono text-xs md:text-sm uppercase font-bold transition-all duration-300"
          :class="
            activeCategory === cat
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black'
          ">
          {{ cat }}
        </button>
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
                class="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-20 shadow-sm border border-gray-600"></div>

              <div
                class="bg-white p-3 pb-8 border border-black/20 shadow-sm transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-md hover:rotate-0 cursor-default rounded-sm">
                <div
                  class="aspect-square bg-gray-50 border border-black/10 mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors rounded-sm">
                  <Icon :icon="skill.identifier" class="w-12 h-12 md:w-14 md:h-14 text-black relative z-10" />
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
