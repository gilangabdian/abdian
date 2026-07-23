<script setup>
import { adminLogout } from "../../lib/api/AdminApi";
import { useLocalStorage } from "@vueuse/core";
import { useRouter } from "vue-router";
import { alertError } from "../../lib/alert";
import { onBeforeMount } from "vue";

const token = useLocalStorage("token", "");

const router = useRouter();

async function handleLogout() {
  const response = await adminLogout(token.value);
  const responseBody = await response.json();
  console.log(responseBody);

  if (response.status === 200) {
    token.value = "";
    await router.push({
      path: "/admin/login",
    });
  } else {
    await alertError(responseBody.message);
  }
}

onBeforeMount(async () => {
  await handleLogout();
});
</script>
<template></template>

<style scoped></style>
