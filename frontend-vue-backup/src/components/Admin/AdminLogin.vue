<script setup>
import { reactive, ref } from "vue";
import { adminLogin } from "../../lib/api/AdminApi";
import { useLocalStorage } from "@vueuse/core";
import { useRouter } from "vue-router";
import { alertError } from "../../lib/alert";
import { Icon } from "@iconify/vue";

const token = useLocalStorage("token", "");
const admin = reactive({
  email: "",
  password: "",
});
const router = useRouter();
const isLoading = ref(false);

async function handleSubmit() {
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    const response = await adminLogin(admin);
    const responseBody = await response.json();

    if (response.status === 200) {
      token.value = responseBody.token;
      await router.push({
        path: "/admin/dashboard",
      });
    } else {
      await alertError(responseBody.errors || responseBody.message);
    }
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#121212] flex items-center justify-center p-6 font-sans selection:bg-white selection:text-black">
    <div class="w-full max-w-sm">
      <!-- Header Minimalis -->
      <div class="text-center mb-10">
        <h1 class="text-white text-2xl font-bold tracking-tight">Admin Portal</h1>
        <p class="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-2">Sign in to continue</p>
      </div>

      <!-- Form -->
      <form v-on:submit.prevent="handleSubmit" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Email Address</label>
          <input v-model="admin.email" type="email" required
            class="w-full bg-[#1e1e1e] border border-white/5 rounded-xl py-3.5 px-4 text-white text-sm outline-none focus:border-white/20 focus:bg-[#252525] transition-all placeholder:text-gray-600"
            placeholder="admin@example.com" />
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Password</label>
          <input v-model="admin.password" type="password" required
            class="w-full bg-[#1e1e1e] border border-white/5 rounded-xl py-3.5 px-4 text-white text-sm outline-none focus:border-white/20 focus:bg-[#252525] transition-all placeholder:text-gray-600"
            placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="isLoading"
          class="w-full bg-white text-black font-bold py-3.5 rounded-xl text-sm transition-all hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6">
          <Icon v-if="isLoading" icon="line-md:loading-twotone-loop" class="w-5 h-5" />
          <span>{{ isLoading ? 'Authenticating...' : 'Sign In' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
