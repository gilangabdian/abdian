<script setup>
import { ref, onMounted, computed } from "vue";
import { getAllBlogsPublic } from "../../lib/api/BlogApi";
import { useRouter } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Icon } from "@iconify/vue";

const blogs = ref([]);
const isLoading = ref(true);
const router = useRouter();

// Language State (ID or EN)
const currentLang = ref(localStorage.getItem('blogLang') || 'id');
const updateLang = () => {
  localStorage.setItem('blogLang', currentLang.value);
};

const groupedBlogs = computed(() => {
  const groups = {};
  blogs.value.forEach((blog) => {
    const year = new Date(blog.created_at).getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(blog);
  });

  // Sort descending years
  const sortedKeys = Object.keys(groups).sort((a, b) => b - a);
  const result = [];
  sortedKeys.forEach((year) => {
    result.push({ year, blogs: groups[year] });
  });
  return result;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month.toLowerCase()} ${day}`;
};

onMounted(async () => {
  try {
    const response = await getAllBlogsPublic();
    blogs.value = await response.json();
  } catch (error) {
    console.error("Failed to load blogs", error);
  } finally {
    isLoading.value = false;
    NProgress.done();
  }
});
</script>

<template>
  <div class="pt-16 md:pt-40 pb-16 min-h-screen bg-white dark:bg-black flex flex-col items-center font-[Inter]">
    <div class="w-full max-w-3xl px-4 md:px-8">
      <!-- Empty State -->
      <div v-if="!isLoading && blogs.length === 0" class="text-center text-neutral-500 py-12">no article yet!</div>

      <!-- Blog List by Year -->
      <div v-else-if="!isLoading && blogs.length > 0" class="w-full flex flex-col gap-24 relative">

        <!-- Language Toggle -->
        <div class="absolute -top-10 left-2 md:left-8 flex items-center justify-start z-20">
          <label class="flex items-center gap-2 cursor-pointer text-sm text-black/30 dark:text-white/30">
            <input
              type="checkbox"
              v-model="currentLang"
              true-value="en"
              false-value="id"
              @change="updateLang"
              class="w-[13px] h-[13px] cursor-pointer appearance-none border-[1.4px] border-black/30 dark:border-white/30 rounded-[1px] bg-transparent flex items-center justify-center
                     checked:before:content-['']
                     checked:before:w-[4px] checked:before:h-[6.5px] checked:before:border-r-[1.4px] checked:before:border-b-[1.4px]
                     checked:before:border-black/30 dark:checked:before:border-white/30 checked:before:rotate-45 checked:before:-mt-[1px]"
            />
            <span>Read in English</span>
          </label>
        </div>

        <div v-for="group in groupedBlogs" :key="group.year" class="relative w-full mt-10 md:mt-16">
          <!-- Background Year (Hollow Text) -->
          <div
            class="absolute top-0 -left-2 md:-left-4 -translate-y-6 md:-translate-y-15 text-[7rem] md:text-[8rem] font-black select-none z-0 leading-none pointer-events-none year-watermark">
            {{ group.year }}
          </div>

          <!-- Articles List -->
          <div class="relative z-10 w-full flex flex-col items-start px-2 pt-6 md:pt-0 md:px-8">
            <component
              v-for="blog in group.blogs"
              :key="blog.id"
              :is="blog.is_external ? 'a' : 'router-link'"
              :[blog.is_external?'href':'to']="blog.is_external ? blog.external_url : '/blogs/' + blog.slug"
              :target="blog.is_external ? '_blank' : undefined"
              :rel="blog.is_external ? 'noopener noreferrer' : undefined"
              class="blog-row cursor-pointer group flex flex-col sm:flex-row justify-start items-start sm:items-center w-full py-2 transition-colors gap-3 md:gap-4">

              <h2
                class="text-lg md:text-xl font-small text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors leading-tight flex items-center gap-[2px]">
                {{ currentLang === 'en' ? (blog.title_en || blog.title) : blog.title }}
                <Icon v-if="blog.is_external" icon="carbon:arrow-up-right" class="w-3 h-4 -mt-1 opacity-50 transition-opacity" />
              </h2>

              <div
                class="flex items-center gap-2 mt-1 sm:mt-0 text-sm text-neutral-400 dark:text-neutral-500 whitespace-nowrap group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                <span>{{ formatDate(blog.created_at) }}</span>
                <span v-if="!blog.is_external" class="text-[10px]">•</span>
                <span v-if="!blog.is_external">{{ blog.read_time }} min</span>
              </div>
            </component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.year-watermark {
  /* Teks transparan agar isi pola terlihat */
  color: transparent;
  /* Garis Tepi (Hitam Samar) */
  -webkit-text-stroke: 1px rgba(0, 0, 0, 0.1);

  /* Pola Arsiran Hitam (Light Theme) */
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.04) 0px,
    rgba(0, 0, 0, 0.04) 2px,
    transparent 2px,
    transparent 8px
  );
  -webkit-background-clip: text;
  background-clip: text;
}

.dark .year-watermark {
  /* Garis Tepi (Putih Samar) */
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);

  /* Pola Arsiran Putih (Dark Theme) */
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.06) 0px,
    rgba(255, 255, 255, 0.06) 2px,
    transparent 2px,
    transparent 8px
  );
}
</style>
