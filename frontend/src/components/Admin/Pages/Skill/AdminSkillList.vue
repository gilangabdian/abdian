<script setup>
import { ref, onMounted, reactive, computed, nextTick } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import { getSkills, addSkill, deleteSkill, updateSkill, bulkDeleteSkills, reorderSkills, updateSkillCategory, deleteSkillCategory } from "../../../../lib/api/SkillApi";
import { getProfile, saveProfile } from "../../../../lib/api/ProfileApi";
import { alertSuccess, alertError, alertConfirm, alertPrompt } from "../../../../lib/alert";

const token = useLocalStorage("token", "");
const skills = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);

const isEditing = ref(false);
const editId = ref(null);

const isSelectMode = ref(false);
const selectedIds = ref([]);

const formTopRef = ref(null);
const categorizedTech = {
  "Languages & Frontend": [
    { name: "JavaScript", id: "simple-icons:javascript" },
    { name: "TypeScript", id: "simple-icons:typescript" },
    { name: "HTML5", id: "simple-icons:html5" },
    { name: "CSS3", id: "simple-icons:css3" },
    { name: "Vue.js", id: "simple-icons:vuedotjs" },
    { name: "React", id: "simple-icons:react" },
    { name: "Next.js", id: "simple-icons:nextdotjs" },
    { name: "Tailwind CSS", id: "simple-icons:tailwindcss" },
    { name: "Bootstrap", id: "simple-icons:bootstrap" },
    { name: "Sass", id: "simple-icons:sass" },
    { name: "Redux", id: "simple-icons:redux" },
  ],
  "Backend & Database": [
    { name: "PHP", id: "simple-icons:php" },
    { name: "Laravel", id: "simple-icons:laravel" },
    { name: "Node.js", id: "simple-icons:nodedotjs" },
    { name: "Express", id: "simple-icons:express" },
    { name: "Python", id: "simple-icons:python" },
    { name: "MySQL", id: "simple-icons:mysql" },
    { name: "PostgreSQL", id: "simple-icons:postgresql" },
    { name: "MongoDB", id: "simple-icons:mongodb" },
    { name: "Prisma", id: "simple-icons:prisma" },
  ],
  "Tools & DevOps": [
    { name: "Git", id: "simple-icons:git" },
    { name: "GitHub", id: "simple-icons:github" },
    { name: "Docker", id: "simple-icons:docker" },
    { name: "Figma", id: "simple-icons:figma" },
    { name: "Postman", id: "simple-icons:postman" },
    { name: "Linux", id: "simple-icons:linux" },
    { name: "Nginx", id: "simple-icons:nginx" },
    { name: "Apache", id: "simple-icons:apache" },
    { name: "npm", id: "simple-icons:npm" },
    { name: "pnpm", id: "simple-icons:pnpm" },
    { name: "Yarn", id: "simple-icons:yarn" },
  ],
};

const isLibraryOpen = ref(false);
const form = reactive({ name: "", identifier: "", category: "Frontend", is_active_on_home: true, note: "" });
const showSuggestions = ref(false);

const formCategories = computed(() => {
  const cats = new Set(["Frontend", "Backend", "Cloud & DevOps", "Mobile", "Databases"]);
  skills.value.forEach(s => {
    if (s.category && s.category !== 'Uncategorized') cats.add(s.category);
  });
  return Array.from(cats);
});

const activeCategories = computed(() => {
  const cats = new Set();
  skills.value.forEach(s => {
    if (s.category && s.category !== 'Uncategorized') cats.add(s.category);
  });
  return Array.from(cats);
});

const notesList = ["Main Stack", "Familiar", "Learning"];

// Computed untuk mengelompokkan skills berdasarkan kategori
const groupedSkills = ref({});

// Logic pencarian (flatten data kategori menjadi array biasa untuk suggestion)
const filteredSuggestions = computed(() => {
  if (!form.name) return [];
  const allTechs = Object.values(categorizedTech).flat();
  return allTechs.filter((tech) => tech.name.toLowerCase().includes(form.name.toLowerCase()));
});

const selectTech = (tech) => {
  form.name = tech.name;
  form.identifier = tech.id;
  showSuggestions.value = false;
};

const profileData = ref(null);
const hiddenCategories = ref([]);
const defaultCategory = ref("");
const customOrderedCategories = ref([]);
const isCategoryManagerOpen = ref(false);
const isSavingCategory = ref(false);

const fetchProfile = async () => {
  try {
    const res = await getProfile();
    const data = await res.json();
    profileData.value = data.about;
    hiddenCategories.value = data.about?.hidden_skill_categories || [];
    defaultCategory.value = data.about?.default_skill_category || "";
    const savedOrder = data.about?.skill_categories_order || [];
    
    // Sinkronisasi order dengan activeCategories agar kategori baru tetap muncul
    const allActive = activeCategories.value;
    const ordered = savedOrder.filter(cat => allActive.includes(cat));
    const newCats = allActive.filter(cat => !ordered.includes(cat));
    customOrderedCategories.value = [...ordered, ...newCats];
  } catch (e) {
    console.error(e);
  }
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await getSkills();
    const responseBody = await response.json();
    skills.value = responseBody.data || responseBody;
    
    // Build groupedSkills manually to allow mutation via draggable
    const groups = {};
    skills.value.forEach((skill) => {
      const cat = skill.category || "Frontend";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    const sortedGroups = {};
    formCategories.value.forEach(cat => {
      if (groups[cat]) sortedGroups[cat] = groups[cat];
    });
    Object.keys(groups).forEach(cat => {
      if (!sortedGroups[cat]) sortedGroups[cat] = groups[cat];
    });
    groupedSkills.value = sortedGroups;
    
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchData();
  await fetchProfile();
});

const startEdit = (skill) => {
  isEditing.value = true;
  editId.value = skill.id;
  form.name = skill.name;
  form.identifier = skill.identifier;
  form.category = skill.category || "Frontend";
  form.is_active_on_home = skill.is_active_on_home ?? true;
  form.note = skill.note || "";

  nextTick(() => {
    if (formTopRef.value) {
      formTopRef.value.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });
};

const cancelEdit = () => {
  isEditing.value = false;
  editId.value = null;
  form.name = "";
  form.identifier = "";
  form.category = "Frontend";
  form.is_active_on_home = true;
  form.note = "";
};

const handleSubmit = async () => {
  if (!form.name || !form.identifier) {
    alertError("Nama Skill dan Icon tidak boleh kosong!");
    return;
  }
  isSubmitting.value = true;
  try {
    let response;
    if (isEditing.value) {
      const payload = { name: form.name, identifier: form.identifier, category: form.category, is_active_on_home: form.is_active_on_home, note: form.note };
      response = await updateSkill(token.value, editId.value, payload);
    } else {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("identifier", form.identifier);
      formData.append("category", form.category);
      formData.append("is_active_on_home", form.is_active_on_home ? "1" : "0");
      formData.append("note", form.note);
      response = await addSkill(token.value, formData);
    }

    if (response.ok) {
      await alertSuccess(isEditing.value ? "Skill berhasil diupdate!" : "Skill berhasil ditambahkan!");
      cancelEdit();
      fetchData();
    } else {
      const err = await response.json();
      alertError(err.message || "Gagal menyimpan skill");
    }
  } catch (e) {
    console.error(e);
    alertError("Terjadi kesalahan sistem");
  } finally {
    isSubmitting.value = false;
  }
};

const onDragEnd = async () => {
  const orderedIds = Object.values(groupedSkills.value).flat().map(skill => skill.id);
  try {
    await reorderSkills(token.value, orderedIds);
  } catch (error) {
    console.error("Failed to save new order", error);
    alertError("Failed to save new order");
  }
};

const handleDelete = async (id) => {
  if (!(await alertConfirm("Yakin ingin menghapus skill ini?"))) {
    return;
  }

  try {
    const response = await deleteSkill(token.value, id);
    const responseBody = await response.json();
    if (response.status === 200) {
      await alertSuccess("Skill dihapus!");
      await fetchData();
      selectedIds.value = selectedIds.value.filter(sId => sId !== id);
    } else {
      await alertError(responseBody.message);
    }
  } catch (e) {
    alertError("Gagal menghapus");
  }
};

const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value;
  if (!isSelectMode.value) {
    selectedIds.value = []; // Reset selection when exiting mode
  }
};

const toggleSelection = (id) => {
  if (!isSelectMode.value) return;
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
};

const toggleSelectAll = () => {
  if (selectedIds.value.length === skills.value.length) {
    selectedIds.value = [];
  } else {
    selectedIds.value = skills.value.map(skill => skill.id);
  }
};

const handleBulkDelete = async () => {
  if (selectedIds.value.length === 0) return;
  if (!(await alertConfirm(`Yakin ingin menghapus ${selectedIds.value.length} skill yang dipilih?`))) {
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await bulkDeleteSkills(token.value, selectedIds.value);
    const responseBody = await response.json();
    if (response.status === 200) {
      await alertSuccess(responseBody.message || "Skills berhasil dihapus!");
      await fetchData();
      isSelectMode.value = false;
      selectedIds.value = [];
    } else {
      await alertError(responseBody.message || "Gagal menghapus skills");
    }
  } catch (e) {
    alertError("Terjadi kesalahan sistem");
  } finally {
    isSubmitting.value = false;
  }
};

const toggleCategory = (cat) => {
  const index = hiddenCategories.value.indexOf(cat);
  if (index > -1) {
    hiddenCategories.value.splice(index, 1);
  } else {
    hiddenCategories.value.push(cat);
  }
};

const saveCategoryVisibility = async () => {
  if (!profileData.value) return;
  isSavingCategory.value = true;
  
  const formData = new FormData();
  formData.append("name", profileData.value.name);
  formData.append("job_title", profileData.value.job_title);
  formData.append("about_description", profileData.value.about_description);
  formData.append("default_skill_category", defaultCategory.value);
  
  if (hiddenCategories.value.length === 0) {
    formData.append("hidden_skill_categories[]", "");
  } else {
    hiddenCategories.value.forEach((cat) => {
      formData.append("hidden_skill_categories[]", cat);
    });
  }

  // Tambahkan urutan custom ke formData
  if (customOrderedCategories.value.length === 0) {
    formData.append("skill_categories_order[]", "");
  } else {
    customOrderedCategories.value.forEach((cat) => {
      formData.append("skill_categories_order[]", cat);
    });
  }

  try {
    const res = await saveProfile(token.value, formData);
    if (res.ok) {
      await alertSuccess("Category visibility saved!");
      isCategoryManagerOpen.value = false;
    } else {
      await alertError("Failed to save categories");
    }
  } catch (e) {
    console.error(e);
    alertError("Terjadi kesalahan");
  } finally {
    isSavingCategory.value = false;
  }
};

const editCategoryName = async (oldCatName) => {
  const newName = await alertPrompt(`Edit nama kategori '${oldCatName}'`, oldCatName);
  if (!newName || newName.trim() === "" || newName === oldCatName) return;

  try {
    const res = await updateSkillCategory(token.value, oldCatName, newName);
    const data = await res.json();
    if (res.ok) {
      await alertSuccess(data.message || "Kategori berhasil diubah");
      // Refresh data
      await fetchData();
      await fetchProfile();
    } else {
      await alertError(data.message || "Gagal mengubah kategori");
    }
  } catch (e) {
    console.error(e);
    alertError("Terjadi kesalahan sistem");
  }
};

const deleteCategory = async (catName) => {
  if (!(await alertConfirm(`Yakin ingin menghapus kategori '${catName}'? Semua skill di dalamnya akan dipindahkan ke kategori 'Uncategorized'.`))) {
    return;
  }
  
  try {
    const res = await deleteSkillCategory(token.value, catName);
    const data = await res.json();
    if (res.ok) {
      await alertSuccess(data.message || "Kategori berhasil dihapus");
      await fetchData();
      await fetchProfile();
    } else {
      await alertError(data.message || "Gagal menghapus kategori");
    }
  } catch (e) {
    console.error(e);
    alertError("Terjadi kesalahan sistem");
  }
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-10 border-b-4 border-black pb-4 flex justify-between items-end gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl font-black italic">SKILL MANAGER</h1>
        <p class="font-mono text-gray-600 mt-2 text-sm md:text-base">Manage your tech stack efficiently.</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <button
          v-if="isSelectMode"
          @click="toggleSelectAll"
          class="border-2 border-black px-3 py-1 font-mono font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-black hover:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          {{ selectedIds.length === skills.length ? 'Deselect All' : 'Select All' }}
        </button>
        <button
          v-if="skills.length > 0"
          @click="toggleSelectMode"
          :class="[
            'border-2 border-black px-3 py-1 font-mono font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
            isSelectMode ? 'bg-black text-white' : 'bg-white text-black'
          ]">
          {{ isSelectMode ? 'Cancel' : 'Select Mode' }}
        </button>
        <button
          @click="isCategoryManagerOpen = true"
          class="bg-blue-100 text-blue-900 px-3 py-1 font-mono font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-200 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
          Category Manager
        </button>
        <div class="hidden md:block bg-black text-white px-3 py-1 font-mono font-bold border-2 border-black">{{ skills.length }} SKILLS</div>
      </div>
    </div>

    <div
      ref="formTopRef"
      :class="[ 'border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 transition-colors scroll-mt-24', isEditing ? 'bg-gray-50' : 'bg-white', ]">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 class="font-black text-xl md:text-2xl flex items-center gap-2">
          <Icon :icon="isEditing ? 'lucide:edit' : 'lucide:plus-circle'" />
          {{ isEditing ? "EDIT SKILL" : "ADD NEW SKILL" }}
        </h2>

        <button
          type="button"
          @click="isLibraryOpen = !isLibraryOpen"
          class="flex items-center gap-2 text-xs font-black uppercase border-2 border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
          <Icon :icon="isLibraryOpen ? 'lucide:chevron-up' : 'lucide:layout-grid'" />
          {{ isLibraryOpen ? "Hide Library" : "Browse Tech Library" }}
        </button>
      </div>

      <div :class="['library-grid', isLibraryOpen ? 'is-open' : '']">
        <div class="library-content">
          <div class="mb-8 border-2 border-black bg-gray-50 p-4 font-mono">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-black text-lg underline decoration-black decoration-4 uppercase">Tech Library</h3>
              <p class="hidden sm:block text-[10px] font-mono bg-black text-white px-2 py-1 uppercase">
                Click icon to auto-fill
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="(techs, category) in categorizedTech" :key="category">
                <h4 class="font-black text-[10px] uppercase mb-3 text-gray-500 border-b border-gray-300 pb-1">
                  {{ category }}
                </h4>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="tech in techs"
                    :key="tech.id"
                    type="button"
                    @click="selectTech(tech)"
                    class="group flex flex-col items-center p-2 border-2 border-transparent hover:border-black hover:bg-white transition-all"
                    :title="tech.name">
                    <Icon :icon="tech.id" class="text-2xl group-hover:scale-110 transition-transform" />
                    <span class="text-[9px] font-bold mt-1 truncate w-full text-center">{{ tech.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col md:flex-row gap-6 items-start">
        <div class="w-full md:flex-1 relative">
          <label class="block font-bold mb-2 border-b-2 border-black inline-block">TECH NAME <span class="text-red-500">*</span></label>
          <input
            v-model="form.name"
            @focus="showSuggestions = true"
            @input="showSuggestions = true"
            type="text"
            placeholder="Ketik nama (misal: React)"
            class="w-full p-4 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors"
            autocomplete="off" />
          <div
            v-if="showSuggestions && filteredSuggestions.length > 0"
            class="absolute z-10 w-full bg-white border-2 border-t-0 border-black shadow-lg max-h-48 overflow-y-auto">
            <div
              v-for="tech in filteredSuggestions"
              :key="tech.id"
              @click="selectTech(tech)"
              class="p-3 hover:bg-black hover:text-white cursor-pointer flex items-center gap-3 border-b border-gray-200">
              <Icon :icon="tech.id" class="text-xl" />
              <span class="font-bold">{{ tech.name }}</span>
            </div>
          </div>
        </div>

        <div class="w-full md:flex-1">
          <label class="block font-bold mb-2 border-b-2 border-black inline-block">ICON CODE (AUTO) <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-2">
            <input
              v-model="form.identifier"
              type="text"
              placeholder="simple-icons:..."
              class="w-full p-4 border-2 border-black font-mono bg-gray-100 focus:bg-white focus:outline-none" />
            <div
              class="w-14 h-14 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <Icon :icon="form.identifier" v-if="form.identifier" class="text-3xl" />
              <span v-else class="text-xs text-gray-400">N/A</span>
            </div>
          </div>
          <p class="text-xs mt-1 text-gray-500 font-mono">
            *Code otomatis terisi jika memilih dari saran. Atau cari manual di
            <a href="https://icones.js.org/" target="_blank" class="underline font-bold text-black underline">Icones</a>
            .
          </p>
        </div>

        <div class="w-full md:flex-[0.8]">
          <label class="block font-bold mb-2 border-b-2 border-black inline-block">CATEGORY</label>
          <input
            v-model="form.category"
            list="categories-list"
            class="w-full p-4 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors bg-white rounded-none"
            placeholder="Pilih/ketik kategori"
          />
          <datalist id="categories-list">
            <option v-for="cat in formCategories" :key="cat" :value="cat">{{ cat }}</option>
          </datalist>

          <label class="block font-bold mt-4 mb-2 border-b-2 border-black inline-block">PROFICIENCY/NOTE (Max 20)</label>
          <input
            v-model="form.note"
            list="notes-list"
            maxlength="20"
            class="w-full p-4 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors bg-white rounded-none"
            placeholder="e.g. Main Stack"
          />
          <datalist id="notes-list">
            <option v-for="note in notesList" :key="note" :value="note">{{ note }}</option>
          </datalist>
          
          <div class="mt-4 flex items-center gap-2 border-2 border-black p-3 bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <input type="checkbox" id="isActiveOnHome" v-model="form.is_active_on_home" class="w-5 h-5 accent-black" />
            <label for="isActiveOnHome" class="font-bold cursor-pointer font-mono select-none">Show on Home Page</label>
          </div>
        </div>

        <div class="flex flex-col gap-2 mt-2 md:mt-8 w-full md:w-auto">
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="[ 'h-[58px] font-black px-8 border-2 border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50', isEditing ? 'bg-white text-black border-black hover:bg-gray-500' : 'bg-black text-white hover:bg-white hover:text-black hover:border-black', ]">
            {{ isSubmitting ? "SAVING..." : isEditing ? "UPDATE SKILL" : "SAVE SKILL" }}
          </button>
          <button
            v-if="isEditing"
            @click="cancelEdit"
            type="button"
            class="text-xs font-bold text-black underline hover:text-gray-500 text-center uppercase">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div>
      <h2 class="font-black text-2xl mb-6 uppercase flex items-center gap-3">
        <Icon icon="lucide:zap" />
        Skills
      </h2>

      <div v-if="isLoading" class="text-center font-mono py-10">Loading Data...</div>

      <div
        v-else-if="skills.length === 0"
        class="text-center py-12 border-4 border-black bg-gray-50 flex flex-col items-center gap-4">
        <Icon icon="lucide:ghost" class="text-6xl text-gray-300" />
        <div>
          <h3 class="font-black text-xl uppercase">Nothing here yet</h3>
          <p class="font-mono text-sm text-gray-500">Start adding your first skill above!</p>
        </div>
      </div>

      <div v-else>
        <!-- Loop per kategori -->
        <div v-for="(items, categoryName) in groupedSkills" :key="categoryName" class="mb-12">
          <h3 class="font-black text-xl mb-4 uppercase border-b-4 border-black pb-1 inline-block">{{ categoryName }}</h3>
          
          <draggable 
            v-model="groupedSkills[categoryName]" 
            group="skills" 
            item-key="id" 
            class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
            @end="onDragEnd"
          >
            <template #item="{element: skill}">
              <div
                @click="toggleSelection(skill.id)"
                :class="[
                  'group relative bg-white border-2 border-black flex flex-col items-center hover:-translate-y-1 transition-all duration-200',
                  isSelectMode ? 'cursor-pointer' : '',
                  selectedIds.includes(skill.id) ? 'bg-gray-100 shadow-none translate-y-1' : 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                ]">
                
                <!-- Checkbox (Only visible in select mode) -->
                <div v-if="isSelectMode" class="absolute top-2 left-2 z-10">
                  <div 
                    :class="[
                      'w-6 h-6 border-2 border-black flex items-center justify-center transition-colors',
                      selectedIds.includes(skill.id) ? 'bg-black text-white' : 'bg-white text-transparent'
                    ]">
                    <Icon icon="lucide:check" width="16" stroke-width="4" />
                  </div>
                </div>
                
                <!-- Indicator Visibility (Show on Home) -->
                <div v-if="!skill.is_active_on_home" class="absolute top-2 right-2 text-red-500" title="Hidden on Home">
                  <Icon icon="lucide:eye-off" width="20" stroke-width="2.5" />
                </div>
                
                <!-- Note Badge -->
                <div v-if="skill.note" class="absolute -top-3 -right-3 z-20">
                  <span class="bg-black text-white text-[10px] font-black px-2 py-1 uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    {{ skill.note }}
                  </span>
                </div>
                
                <div class="p-4 flex flex-col items-center gap-4 w-full">
                <div class="w-16 h-16 flex items-center justify-center">
                  <Icon :icon="skill.identifier" :key="skill.identifier" class="text-5xl" />
                </div>
                <div class="text-center w-full pt-2">
                  <h3 class="font-black font-mono text-sm truncate">{{ skill.name }}</h3>
                </div>
              </div>

              <div
                v-if="!isSelectMode"
                class="hidden md:flex absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 backdrop-blur-[1px]">
                <button
                  @click.stop="startEdit(skill)"
                  class="bg-white text-black border-2 border-black p-2 hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Edit">
                  <Icon icon="lucide:edit-2" width="20" />
                </button>
                <button
                  @click.stop="handleDelete(skill.id)"
                  class="bg-red-500 text-white hover:bg-red-600 border-2 border-black p-2 hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Hapus">
                  <Icon icon="lucide:trash-2" width="20" />
                </button>
              </div>

              <div v-if="!isSelectMode" class="flex md:hidden w-full border-t-2 border-black">
                <button
                  @click.stop="startEdit(skill)"
                  class="flex-1 bg-gray-200 py-3 flex items-center justify-center border-r-2 border-black active:bg-gray-500">
                  <Icon icon="lucide:edit-2" width="16" />
                </button>
                <button
                  @click.stop="handleDelete(skill.id)"
                  class="bg-red-500 text-white hover:bg-red-600 flex-1 py-3 flex items-center justify-center active:bg-red-700">
                  <Icon icon="lucide:trash-2" width="16" />
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <!-- Sticky Bottom Bar for Mobile Bulk Delete -->
    <div
      v-if="isSelectMode"
      class="fixed bottom-0 left-0 right-0 z-50 p-4 transform transition-transform duration-300 translate-y-0 flex justify-center">
      <div class="bg-black text-white border-2 border-white shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-2xl flex items-center justify-between p-4 max-w-lg w-full">
        <div class="font-bold font-mono">
          {{ selectedIds.length }} Selected
        </div>
        <button
          @click="handleBulkDelete"
          :disabled="selectedIds.length === 0 || isSubmitting"
          class="bg-red-500 hover:bg-red-600 text-white font-black px-4 py-2 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center gap-2">
          <Icon icon="lucide:trash-2" />
          Delete
        </button>
      </div>
    </div>
    
    <!-- Modal Category Manager -->
    <div v-if="isCategoryManagerOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white border-4 border-black p-6 md:p-8 max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]">
        <button @click="isCategoryManagerOpen = false" class="absolute top-4 right-4 hover:scale-110 transition-transform">
          <Icon icon="lucide:x" width="24" stroke-width="3" />
        </button>
        <h2 class="font-black text-2xl mb-2 uppercase">Category Manager</h2>
        <p class="font-mono text-sm text-gray-600 mb-6 border-b-2 border-black pb-4">
          Pilih kategori yang ingin <strong>disembunyikan</strong> dari tab Home Page. Skill di dalamnya akan tetap muncul secara independen.
        </p>
        
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-6">
          <draggable 
            v-model="customOrderedCategories" 
            item-key="cat"
            class="flex flex-col gap-3"
            handle=".drag-handle"
            ghost-class="opacity-50"
          >
            <template #item="{ element: cat }">
              <div class="flex items-center justify-between border-2 border-black p-3 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 hover:text-black transition-colors" title="Drag to reorder">
                    <Icon icon="lucide:grip-vertical" width="16" />
                  </div>
                  <span class="font-bold font-mono">{{ cat }}</span>
                  <button 
                    @click.stop="editCategoryName(cat)" 
                    class="text-gray-500 hover:text-black hover:scale-110 transition-all"
                    title="Edit Kategori"
                  >
                    <Icon icon="lucide:edit" width="16" />
                  </button>
                  <button 
                    @click.stop="deleteCategory(cat)" 
                    class="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                    title="Hapus Kategori"
                  >
                    <Icon icon="lucide:trash-2" width="16" />
                  </button>
                </div>
                <label class="flex items-center gap-2 cursor-pointer">
                  <span class="text-xs uppercase font-black" :class="hiddenCategories.includes(cat) ? 'text-red-500' : 'text-green-600'">
                    {{ hiddenCategories.includes(cat) ? 'Hidden' : 'Visible' }}
                  </span>
                  <div 
                    :class="[
                      'w-6 h-6 border-2 border-black flex items-center justify-center',
                      hiddenCategories.includes(cat) ? 'bg-black text-white' : 'bg-white text-transparent'
                    ]">
                    <Icon icon="lucide:eye-off" width="16" />
                  </div>
                  <input type="checkbox" :checked="hiddenCategories.includes(cat)" @change="toggleCategory(cat)" class="hidden" />
                </label>
              </div>
            </template>
          </draggable>
        </div>
        
        <div class="mb-6 shrink-0">
          <label class="block font-bold font-mono text-sm mb-2 uppercase">Default Active Kategori (Home)</label>
          <select 
            v-model="defaultCategory" 
            class="w-full p-3 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">-- Pill "All" --</option>
            <template v-for="cat in activeCategories" :key="'def-'+cat">
              <!-- Jangan biarkan hidden category jadi default -->
              <option :value="cat" :disabled="hiddenCategories.includes(cat)">
                {{ cat }} {{ hiddenCategories.includes(cat) ? '(Hidden)' : '' }}
              </option>
            </template>
          </select>
        </div>
        
        
        <button 
          @click="saveCategoryVisibility" 
          :disabled="isSavingCategory"
          class="w-full shrink-0 bg-black text-white font-black py-4 border-2 border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {{ isSavingCategory ? 'SAVING...' : 'SAVE CATEGORY VISIBILITY' }}
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* TEKNIK TERBAIK UNTUK ANIMASI COLLAPSE/EXPAND */
.library-grid {
  display: grid;
  grid-template-rows: 0fr; /* Secara default tertutup */
  transition:
    grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
  opacity: 0;
  pointer-events: none; /* Cegah klik saat tertutup */
}

.library-grid.is-open {
  grid-template-rows: 1fr; /* Terbuka penuh menyesuaikan konten */
  opacity: 1;
  pointer-events: auto;
  margin-bottom: 2rem;
}

.library-content {
  overflow: hidden; /* Wajib ada agar konten tidak overflow saat tertutup */
}
</style>
