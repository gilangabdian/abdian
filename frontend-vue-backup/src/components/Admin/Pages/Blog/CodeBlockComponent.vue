<script setup>
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const languages = [
  'html',
  'css',
  'javascript',
  'typescript',
  'vue',
  'php',
  'python',
  'json',
  'bash',
  'markdown'
]
</script>

<template>
  <node-view-wrapper class="code-block border-2 border-black rounded-lg overflow-hidden my-4" data-type="codeBlock">
    <div class="bg-gray-100 border-b-2 border-black p-2 flex justify-between items-center select-none" contenteditable="false">
      <div class="flex items-center gap-2">
        <div class="flex gap-1.5 ml-2">
          <div class="w-3 h-3 rounded-full bg-red-500 border border-black/20"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500 border border-black/20"></div>
          <div class="w-3 h-3 rounded-full bg-green-500 border border-black/20"></div>
        </div>
        <span class="ml-2 font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">Snippet</span>
      </div>
      
      <select
        class="bg-white border-2 border-black rounded px-2 py-1 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-gray-50 focus:outline-none"
        :value="node.attrs.language"
        @change="updateAttributes({ language: $event.target.value })"
      >
        <option :value="null">auto</option>
        <option disabled>—</option>
        <option v-for="language in languages" :value="language" :key="language">
          {{ language }}
        </option>
      </select>
    </div>
    
    <pre class="!p-4 !m-0 overflow-x-auto"><node-view-content as="code" class="font-mono text-sm block min-h-[1.5rem]" /></pre>
  </node-view-wrapper>
</template>

<style>
/* Reset code block styling inside node view so it doesn't conflict */
.code-block {
  position: relative;
}
</style>
