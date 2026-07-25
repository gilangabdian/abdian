import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import Swal from 'sweetalert2';

export default function RawHtmlComponent({
  node,
  updateAttributes,
  deleteNode,
}: any) {
  
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
        const textarea = document.getElementById("swal-input-html-edit") as HTMLTextAreaElement;
        if (textarea) {
          textarea.value = node.attrs.html;
        }
      },
      preConfirm: () => {
        const textarea = document.getElementById("swal-input-html-edit") as HTMLTextAreaElement;
        const html = textarea ? textarea.value : "";
        if (!html) {
          Swal.showValidationMessage("Kode HTML tidak boleh kosong");
        }
        return html;
      }
    });

    if (htmlText) {
      updateAttributes({ html: htmlText });
    }
  };

  return (
    <NodeViewWrapper className="relative border-4 border-dashed border-gray-400 p-4 my-4 bg-gray-50 group">
      <div className="absolute -top-4 left-4 bg-white px-2 text-xs font-bold font-mono text-black border-2 border-black">
        HTML/CSS/JS Embed
      </div>
      
      <div className="absolute -top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button 
          type="button"
          onClick={editNode} 
          className="bg-blue-500 text-white px-2 text-xs font-bold font-mono border-2 border-black"
          title="Edit Embed"
        >
          Edit
        </button>
        <button 
          type="button"
          onClick={deleteNode} 
          className="bg-red-500 text-white px-2 text-xs font-bold font-mono border-2 border-black"
          title="Hapus Embed"
        >
          X
        </button>
      </div>
      
      {/* Render raw HTML */}
      <div 
        dangerouslySetInnerHTML={{ __html: node.attrs.html }} 
        style={{ all: 'initial', fontFamily: 'inherit', display: 'block', width: '100%' }}
      ></div>
    </NodeViewWrapper>
  );
}
