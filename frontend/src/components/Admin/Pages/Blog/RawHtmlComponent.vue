<template>
  <node-view-wrapper class="relative border-4 border-dashed border-gray-400 p-4 my-4 bg-gray-50 group">
    <div class="absolute -top-4 left-4 bg-white px-2 text-xs font-bold font-mono text-black border-2 border-black">
      HTML/CSS/JS Embed
    </div>
    
    <div class="absolute -top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
      <button 
        type="button"
        @click="editNode" 
        class="bg-blue-500 text-white px-2 text-xs font-bold font-mono border-2 border-black"
        title="Edit Embed">
        Edit
      </button>
      <button 
        type="button"
        @click="deleteNode" 
        class="bg-red-500 text-white px-2 text-xs font-bold font-mono border-2 border-black"
        title="Hapus Embed">
        X
      </button>
    </div>
    
    <!-- Render raw HTML -->
    <div v-html="node.attrs.html" class="raw-embed-content"></div>
  </node-view-wrapper>
</template>

<script setup>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import Swal from 'sweetalert2'

const props = defineProps(nodeViewProps)

const deleteNode = () => {
  props.deleteNode()
}

const editNode = async () => {
  const { value: htmlText } = await Swal.fire({
    title: "Edit Embed HTML/CSS/JS",
    html: `
      <div class="text-left font-mono text-sm mb-2 text-gray-700">
        Kamu bisa mengedit kode gabungan <b>HTML</b>, <b>&lt;style&gt;</b> (CSS), dan <b>&lt;script&gt;</b> di sini.
      </div>
      <textarea id="swal-input-html-edit" class="w-full h-48 p-2 border-2 border-black font-mono text-sm" placeholder="<svg>...</svg>\n<style>...</style>"></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: "Update Embed",
    confirmButtonColor: "#000",
    didOpen: () => {
      // Set value of textarea to current html
      document.getElementById("swal-input-html-edit").value = props.node.attrs.html;
    },
    preConfirm: () => {
      const html = document.getElementById("swal-input-html-edit").value;
      if (!html) {
        Swal.showValidationMessage("Kode HTML tidak boleh kosong");
      }
      return html;
    }
  });

  if (htmlText) {
    props.updateAttributes({ html: htmlText });
  }
}
</script>

<style>
/* Jangan berikan styling yang merusak isi embed */
.raw-embed-content {
  all: initial; /* Reset agar tidak kena efek Tailwind bawaan admin, biarkan CSS SVG/HTML jalan natural */
  font-family: inherit;
  display: block;
  width: 100%;
}
</style>
