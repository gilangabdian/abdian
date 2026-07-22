<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, nextTick } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import {
  getAllExperiences,
  adminUploadExperience,
  adminUpdateExperience,
  adminDeleteExperience,
} from "../../../../lib/api/ExperienceApi";
import { alertSuccess, alertError, alertConfirmExperience } from "../../../../lib/alert";
import { marked } from "marked";

// --- STATE MANAGEMENT ---
const token = useLocalStorage("token", "");
const experiences = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);

const renderMarkdown = (text) => {
  if (!text) return "";
  // Tambahkan { breaks: true } agar baris baru otomatis terdeteksi
  return marked.parse(text, { breaks: true });
};

// State untuk Edit Mode
const isEditing = ref(false);
const editId = ref(null);

// Ref untuk scroll otomatis ke form saat klik edit
const formTopRef = ref(null);

// Form Data Model
const form = reactive({
  company_name: "",
  role: "",
  status: "Full-time", // Default value
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  is_current: false, // Checkbox helper
  is_active: true, // Toggle visibility
});

const statusOptions = ["Full-time", "Part-time", "Freelance", "Internship", "Contract", "Education"];

// --- FETCH DATA ---
const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await getAllExperiences();
    const result = await response.json();
    experiences.value = result.data || result;
    // Sort descending by start date
    experiences.value.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  } catch (error) {
    console.error(error);
    alertError("Gagal mengambil data experience");
  } finally {
    isLoading.value = false;
  }
};

// --- CLICK OUTSIDE HANDLER (FIX SCROLL ISSUE) ---
const dropdownRef = ref(null);

const handleClickOutside = (event) => {
  if (isStatusDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isStatusDropdownOpen.value = false;
  }
};

onMounted(() => {
  fetchData();
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// --- LOGIC FORM ---
const handleCurrentChange = () => {
  if (form.is_current) {
    form.end_date = ""; // Reset end date visual
  }
};

const resetForm = () => {
  form.company_name = "";
  form.role = "";
  form.status = "Full-time";
  form.location = "";
  form.start_date = "";
  form.end_date = "";
  form.description = "";
  form.is_current = false;
  form.is_active = true;
  isEditing.value = false;
  editId.value = null;
  isStatusDropdownOpen.value = false;
};

const startEdit = (item) => {
  isEditing.value = true;
  editId.value = item.id;

  form.company_name = item.company_name;
  form.role = item.role;
  form.status = item.status;
  form.location = item.location || "";
  form.start_date = item.start_date ? item.start_date.substring(0, 10) : "";
  form.end_date = item.end_date ? item.end_date.substring(0, 10) : "";
  form.description = item.description;
  form.is_current = !item.end_date; // Jika end_date null, berarti current
  form.is_active = item.is_active ?? true;

  nextTick(() => {
    if (formTopRef.value) {
      formTopRef.value.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
};

// --- CUSTOM DROPDOWN STATE ---
const isStatusDropdownOpen = ref(false);

const selectStatus = (value) => {
  form.status = value;
  isStatusDropdownOpen.value = false;
};

const handleSubmit = async () => {
  if (!form.company_name || !form.role || !form.start_date) {
    alertError("Nama Perusahaan, Role, dan Tanggal Mulai wajib diisi!");
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      company_name: form.company_name,
      role: form.role,
      status: form.status,
      location: form.location,
      start_date: form.start_date,
      // Logic: jika is_current true, kirim null, jika tidak kirim value end_date
      end_date: form.is_current ? null : form.end_date,
      description: form.description,
      is_active: form.is_active,
    };

    let response;
    if (isEditing.value) {
      response = await adminUpdateExperience(token.value, editId.value, payload);
    } else {
      response = await adminUploadExperience(token.value, payload);
    }

    const responseBody = await response.json();

    if (response.ok) {
      await alertSuccess(isEditing.value ? "Experience Updated! 🚀" : "Experience Added! 🎉");
      resetForm();
      fetchData();
    } else {
      alertError(responseBody.message || "Gagal menyimpan data.");
    }
  } catch (e) {
    console.error(e);
    alertError("Terjadi kesalahan sistem.");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  const confirmed = await alertConfirmExperience("Yakin ingin menghapus history ini?");
  if (!confirmed) return;

  try {
    const response = await adminDeleteExperience(token.value, id);
    if (response.ok) {
      alertSuccess("Experience deleted! 🗑️");
      fetchData();
    } else {
      alertError("Gagal menghapus data.");
    }
  } catch (e) {
    alertError("Terjadi kesalahan sistem.");
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "PRESENT";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(date).toUpperCase();
};
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div
      class="mb-10 border-b-4 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl font-black italic uppercase">EXPERIENCE MANAGER</h1>
        <p class="font-mono text-gray-600 mt-2 text-sm md:text-base">Track your professional journey & career path.</p>
      </div>
      <div class="hidden md:block bg-black text-white px-3 py-1 font-mono font-bold">
        {{ experiences.length }} EXPERIENCES
      </div>
    </div>

    <div
      ref="formTopRef"
      :class="[ 'border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16 transition-colors scroll-mt-24 relative', isEditing ? 'bg-gray-50' : 'bg-white', ]">
      <div
        v-if="isEditing"
        class="absolute -top-4 -right-2 bg-white border-2 border-black px-3 py-1 font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3">
        EDIT MODE ON
      </div>

      <h2 class="font-black text-lg md:text-2xl mb-6 flex items-center gap-2">
        <Icon :icon="isEditing ? 'lucide:edit-3' : 'lucide:plus-square'" />
        {{ isEditing ? "EDIT EXPERIENCE" : "ADD NEW EXPERIENCE" }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-bold mb-2 text-sm uppercase">
              Company Name
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.company_name"
              type="text"
              placeholder="e.g. Stark Industries"
              class="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400" />
          </div>
          <div>
            <label class="block font-bold mb-2 text-sm uppercase">
              Role / Job Title
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.role"
              type="text"
              placeholder="e.g. Lead Engineer"
              class="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="relative" ref="dropdownRef">
            <label class="block font-bold mb-2 text-sm uppercase">Employment Type <span class="text-red-500">*</span></label>
            <div class="relative z-20">
              <button
                type="button"
                @click.stop="isStatusDropdownOpen = !isStatusDropdownOpen"
                class="w-full font-mono bg-white flex justify-between items-center focus:outline-none transition-all text-left"
                :class="[ 'border-2 border-black px-3', isStatusDropdownOpen ? 'border-b-0 pb-[14px] pt-3 bg-white shadow-none' : 'py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]', ]">
                <span class="truncate">{{ form.status }}</span>
                <Icon
                  icon="lucide:chevron-down"
                  class="transition-transform duration-200"
                  :class="isStatusDropdownOpen ? 'rotate-180' : ''" />
              </button>

              <div
                v-if="isStatusDropdownOpen"
                class="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                <div
                  v-for="opt in statusOptions"
                  :key="opt"
                  @click="selectStatus(opt)"
                  class="p-3 border-b-2 border-black last:border-b-0 cursor-pointer font-mono text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group"
                  :class="form.status === opt ? 'bg-gray-200' : ''">
                  <span>{{ opt }}</span>
                  <Icon v-if="form.status === opt" icon="lucide:check" class="group-hover:text-black text-black" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-bold mb-2 text-sm uppercase">
              Location
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.location"
              type="text"
              placeholder="e.g. Jakarta, ID (Remote)"
              class="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label class="block font-bold mb-2 text-sm uppercase">
              Start Date
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" />
          </div>

          <div class="flex flex-col">
            <label class="block font-bold mb-2 text-sm uppercase">End Date</label>
            <input
              v-model="form.end_date"
              type="date"
              :disabled="form.is_current"
              :class="[ 'w-full p-3 border-2 border-black font-mono focus:outline-none transition-all', form.is_current ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'focus:bg-gray-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]', ]" />

            <div class="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="currentJob"
                v-model="form.is_current"
                @change="handleCurrentChange"
                class="w-5 h-5 border-2 border-black accent-black focus:ring-0 cursor-pointer" />
              <label for="currentJob" class="font-bold text-sm uppercase cursor-pointer select-none">
                {{ form.status === "Education" ? "I am currently studying here" : "I currently work here" }}
              </label>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-bold mb-2 text-sm uppercase flex justify-between">
            <span>Description / Achievements (Markdown Supported) <span class="text-red-500">*</span></span>
            <span class="text-[10px] text-gray-400 capitalize font-mono">use **bold**, *italic*, or - bullets</span>
          </label>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              v-model="form.description"
              rows="8"
              placeholder="- **Developed** cool stuff using Vue.js
- *Improved* performance by 20%"
              class="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-y"></textarea>

            <div class="border-2 border-black border-dashed p-3 bg-gray-50 overflow-y-auto max-h-[250px]">
              <div class="text-[10px] font-black uppercase text-gray-400 mb-2">Live Preview:</div>
              <div v-html="renderMarkdown(form.description)" class="markdown-preview font-mono text-sm"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 bg-gray-50 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max">
          <input
            type="checkbox"
            id="isActive"
            v-model="form.is_active"
            class="w-6 h-6 border-2 border-black accent-black focus:ring-0 cursor-pointer" />
          <label for="isActive" class="font-black uppercase cursor-pointer select-none">
            Show on Public Homepage
          </label>
        </div>

        <div class="flex flex-col md:flex-row gap-4 pt-4 border-t-2 border-black border-dashed">
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="[ 'flex-1 py-3 font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 uppercase flex justify-center items-center gap-2', isEditing ? 'bg-white hover:bg-gray-200' : 'bg-black text-white hover:text-black hover:bg-gray-100 hover:bg-gray-800', ]">
            <Icon
              :icon="isSubmitting ? 'svg-spinners:3-dots-fade' : isEditing ? 'lucide:save' : 'lucide:plus-circle'" />
            {{ isSubmitting ? "SAVING..." : isEditing ? "UPDATE EXPERIENCE" : "SAVE EXPERIENCE" }}
          </button>

          <button
            v-if="isEditing"
            @click="resetForm"
            type="button"
            class="md:w-auto w-full py-3 px-8 font-bold border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 hover:text-gray-500 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all uppercase">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div>
      <h2 class="font-black text-2xl mb-6 uppercase flex items-center gap-3">
        <Icon icon="lucide:history" />
        Experience History
      </h2>

      <div
        v-if="isLoading"
        class="p-12 text-center border-4 border-black border-dashed font-mono animate-pulse bg-white">
        LOADING DATA...
      </div>

      <div
        v-else-if="experiences.length === 0"
        class="text-center py-12 border-4 border-black bg-gray-50 flex flex-col items-center gap-4">
        <Icon icon="lucide:ghost" class="text-6xl text-gray-300" />
        <div>
          <h3 class="font-black text-xl uppercase">Nothing here yet</h3>
          <p class="font-mono text-sm text-gray-500">Start adding your first job above!</p>
        </div>
      </div>

      <div v-else class="space-y-8 relative">
        <div
          class="hidden lg:block absolute left-[150px] top-4 bottom-4 w-1 bg-black border-x border-black bg-opacity-20 z-0"></div>

        <div
          v-for="(exp, index) in experiences"
          :key="exp.id"
          class="relative z-10 flex flex-col lg:flex-row gap-6 items-stretch group">
          <div class="hidden lg:flex w-[150px] flex-col items-end pt-5 pr-6 flex-shrink-0 text-right">
            <span class="font-black text-xl leading-none">{{ formatDate(exp.start_date).split(" ")[1] }}</span>
            <span class="font-mono text-sm font-bold text-gray-500">
              {{ formatDate(exp.start_date).split(" ")[0] }}
            </span>
            <div class="h-8 w-[2px] bg-black my-2"></div>
            <span class="font-black text-lg leading-none" :class="!exp.end_date ? 'text-black' : ''">
              {{ exp.end_date ? formatDate(exp.end_date).split(" ")[1] : "NOW" }}
            </span>
            <span v-if="exp.end_date" class="font-mono text-sm font-bold text-gray-500">
              {{ formatDate(exp.end_date).split(" ")[0] }}
            </span>
          </div>

          <div
            class="hidden lg:block absolute left-[142px] top-6 w-5 h-5 bg-white border-4 border-black rounded-full z-20 group-hover:scale-125 group-hover:bg-white transition-transform"></div>

          <div
            class="flex-1 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-all duration-300">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span
                class="bg-black text-white px-2 py-0.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]">
                {{ exp.status }}
              </span>
              <span v-if="!exp.is_active" class="bg-red-500 text-white px-2 py-0.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] animate-pulse">
                HIDDEN FROM PUBLIC
              </span>
              <span class="lg:hidden font-mono text-xs font-bold border-2 border-black px-2 py-0.5 bg-gray-100">
                {{ formatDate(exp.start_date) }} - {{ formatDate(exp.end_date) }}
              </span>
              <span
                v-if="!exp.end_date"
                class="bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black text-black px-2 py-0.5 font-black text-[10px] uppercase animate-pulse">
                {{ exp.status === "Education" ? "Ongoing / Active" : "Current Job" }}
              </span>
            </div>

            <div class="border-b-2 border-black border-dashed pb-3 mb-3">
              <h3 class="text-2xl font-black uppercase italic leading-tight">{{ exp.role }}</h3>
              <div class="flex items-center gap-2 text-black underline font-bold mt-1">
                <Icon :icon="exp.status === 'Education' ? 'lucide:graduation-cap' : 'lucide:building-2'" />
                {{ exp.company_name }}
              </div>

              <div v-if="exp.location" class="flex items-center gap-2 text-gray-500 font-bold text-sm">
                <Icon icon="lucide:map-pin" class="text-black" />
                {{ exp.location }}
              </div>
            </div>

            <p class="font-mono text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-6">
              {{ exp.description }}
            </p>

            <div class="flex gap-3 justify-end">
              <button
                @click="startEdit(exp)"
                class="flex items-center gap-2 px-4 py-2 bg-gray-200 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:scale-105 transition-transform uppercase">
                <Icon icon="lucide:pencil" />
                Edit
              </button>
              <button
                @click="handleDelete(exp.id)"
                class="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform uppercase">
                <Icon icon="lucide:trash-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.markdown-preview :deep(ul) {
  list-style-type: disc !important;
  margin-left: 1.5rem !important;
  margin-bottom: 1rem !important;
}
.markdown-preview :deep(li) {
  display: list-item !important;
}
.markdown-preview :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
