<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { useLocalStorage } from "@vueuse/core";
import {
  getAllContacts,
  adminUploadContact,
  adminUpdateContact,
  adminDeleteContact,
} from "../../../../lib/api/ContactApi";
import { alertSuccess, alertError, alertConfirmContact } from "../../../../lib/alert";

// --- STATE MANAGEMENT ---
const token = useLocalStorage("token", "");
const contacts = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);

// State untuk Form & Edit Mode
const formRef = ref(null); // Untuk auto-scroll
const isEditing = ref(false);
const editId = ref(null);

const form = reactive({
  platform_name: "",
  url: "",
  icon: "",
});

// Common Icons Helper
const commonIcons = [
  { name: "Instagram", id: "mdi:instagram" },
  { name: "GitHub", id: "mdi:github" },
  { name: "LinkedIn", id: "mdi:linkedin" },
  { name: "Twitter/X", id: "simple-icons:x" },
  { name: "Email", id: "mdi:email" },
  { name: "WhatsApp", id: "mdi:whatsapp" },
  { name: "Discord", id: "simple-icons:discord" },
  { name: "YouTube", id: "mdi:youtube" },
];

// --- LOGIC / FUNCTIONS ---

const fetchContacts = async () => {
  isLoading.value = true;
  try {
    const response = await getAllContacts();
    const data = await response.json();
    console.log(data);
    contacts.value = data.data || data;
  } catch (error) {
    console.error(error);
    alertError("Gagal mengambil data kontak");
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.platform_name = "";
  form.url = "";
  form.icon = "";
  isEditing.value = false;
  editId.value = null;
};

const selectCommonIcon = (item) => {
  form.platform_name = item.name;
  form.icon = item.id;
};

const handleEdit = (contact) => {
  isEditing.value = true;
  editId.value = contact.id;

  // Isi form dengan data yang mau diedit
  form.platform_name = contact.platform_name;
  form.url = contact.url;
  form.icon = contact.icon;

  // Scroll ke Form
  nextTick(() => {
    formRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
};

const handleSubmit = async () => {
  if (!form.platform_name || !form.url || !form.icon) {
    alertError("Mohon lengkapi Nama, URL, dan Icon!");
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      platform_name: form.platform_name,
      url: form.url,
      icon: form.icon,
    };

    let response;
    if (isEditing.value) {
      response = await adminUpdateContact(token.value, editId.value, payload);
      const responseBody = await response.json();
      console.log(responseBody);
    } else {
      response = await adminUploadContact(token.value, payload);
      const responseBody = await response.json();
      console.log(responseBody);
    }

    if (response.ok) {
      alertSuccess(isEditing.value ? "Kontak berhasil diupdate!" : "Kontak berhasil ditambahkan!");
      resetForm();
      await fetchContacts(); // Refresh list
    } else {
      const err = await response.json();
      alertError(err.message || "Gagal menyimpan kontak");
    }
  } catch (e) {
    console.error(e);
    alertError("Terjadi kesalahan sistem");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  const confirmed = await alertConfirmContact("Yakin ingin menghapus kontak ini?");
  if (!confirmed) return;

  try {
    const response = await adminDeleteContact(token.value, id);
    const responseBody = await response.json();
    console.log(responseBody);
    if (response.ok) {
      alertSuccess("Kontak berhasil dihapus");
      await fetchContacts();
    } else {
      alertError("Gagal menghapus kontak");
    }
  } catch (e) {
    alertError("Terjadi kesalahan sistem");
  }
};

onMounted(fetchContacts);
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-10 border-b-4 border-black pb-4 flex justify-between items-end">
      <div>
        <h1 class="text-3xl md:text-4xl font-black italic">CONTACT MANAGER</h1>
        <p class="font-mono text-gray-600 mt-2 text-sm md:text-base">Manage social media & links.</p>
      </div>
      <div class="hidden md:block bg-black text-white px-3 py-1 font-mono font-bold">{{ contacts.length }} LINKS</div>
    </div>

    <div
      ref="formRef"
      :class="[ 'border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors mb-12 scroll-mt-24', isEditing ? 'bg-gray-50' : 'bg-white', ]">
      <div class="flex justify-between items-center mb-6">
        <h2 class="font-black text-xl md:text-2xl flex items-center gap-2 uppercase italic">
          <Icon :icon="isEditing ? 'lucide:edit' : 'lucide:plus-circle'" />
          {{ isEditing ? "EDIT CONTACT" : "ADD NEW CONTACT" }}
        </h2>
        <button
          v-if="isEditing"
          @click="resetForm"
          type="button"
          class="text-xs font-bold text-black underline hover:text-gray-500">
          CANCEL
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block font-bold mb-2 border-b-2 border-black inline-block text-sm">PLATFORM NAME <span class="text-red-500">*</span></label>
            <input
              v-model="form.platform_name"
              type="text"
              placeholder="e.g. Instagram"
              class="w-full p-3 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors" />
          </div>

          <div>
            <label class="block font-bold mb-2 border-b-2 border-black inline-block text-sm">LINK / URL <span class="text-red-500">*</span></label>
            <input
              v-model="form.url"
              type="text"
              placeholder="https://..., email pakai mailto:"
              class="w-full p-3 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors" />
          </div>
        </div>

        <div>
          <label class="block font-bold mb-2 border-b-2 border-black inline-block text-sm">ICON CODE (Iconify) <span class="text-red-500">*</span></label>
          <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div class="flex-1 w-full flex items-center gap-2">
              <input
                v-model="form.icon"
                type="text"
                placeholder="mdi:instagram"
                class="w-full p-3 border-2 border-black font-mono bg-gray-50 focus:bg-white focus:outline-none" />
              <div
                class="w-12 h-12 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Icon v-if="form.icon" :icon="form.icon" class="text-2xl" />
                <span v-else class="text-xs text-gray-400">?</span>
              </div>
            </div>

            <div class="flex gap-2 flex-wrap">
              <button
                v-for="item in commonIcons"
                :key="item.id"
                type="button"
                @click="selectCommonIcon(item)"
                class="px-2 py-1 text-xs font-mono border border-black hover:bg-black hover:text-white transition-colors"
                title="Pakai icon ini">
                {{ item.name }}
              </button>
            </div>
          </div>
          <p class="text-xs mt-1 text-gray-500 font-mono">
            *Cari kode icon di
            <a href="https://icones.js.org/" target="_blank" class="underline font-bold text-black underline">Icones.js.org</a>
          </p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          :class="[ 'h-12 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed', isEditing ? 'bg-white hover:bg-gray-500' : 'bg-black text-white hover:bg-gray-800', ]">
          {{ isSubmitting ? "SAVING..." : isEditing ? "UPDATE CONTACT" : "ADD CONTACT" }}
        </button>
      </form>
    </div>

    <div>
      <h2 class="font-black text-2xl mb-6 uppercase flex items-center gap-3">
        <Icon icon="lucide:share-2" />
        Contacts
      </h2>

      <div v-if="isLoading" class="text-center py-10 font-mono text-gray-500">Loading contacts...</div>
      <div
        v-else-if="contacts.length === 0"
        class="text-center py-12 border-4 border-black bg-gray-50 flex flex-col items-center gap-4">
        <Icon icon="lucide:ghost" class="text-6xl text-gray-300" />
        <div>
          <h3 class="font-black text-xl uppercase">Nothing here yet</h3>
          <p class="font-mono text-sm text-gray-500">Start adding your first contact above!</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="group relative bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center p-4 gap-4">
          <div class="w-14 h-14 flex items-center justify-center border-2 border-black bg-gray-50 shrink-0">
            <Icon :icon="contact.icon" class="text-3xl" />
          </div>

          <div class="flex-1 min-w-0 overflow-hidden">
            <h3 class="font-black text-lg truncate uppercase italic">{{ contact.platform_name }}</h3>
            <a
              :href="contact.url"
              target="_blank"
              class="text-xs font-mono text-gray-600 truncate block hover:text-black underline hover:underline">
              {{ contact.url }}
            </a>
          </div>

          <div
            class="absolute top-2 right-2 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white border border-black p-1 shadow-sm md:border-none md:shadow-none md:bg-transparent">
            <button
              @click="handleEdit(contact)"
              class="p-1.5 bg-white border border-black hover:bg-gray-500 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
              title="Edit">
              <Icon icon="lucide:edit-2" width="14" />
            </button>
            <button
              @click="handleDelete(contact.id)"
              class="bg-red-500 text-white hover:bg-red-600 p-1.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
              title="Hapus">
              <Icon icon="lucide:trash-2" width="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
