import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';

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
];

export default function CodeBlockComponent({
  node,
  updateAttributes,
}: any) {
  return (
    <NodeViewWrapper className="code-block border-2 border-black rounded-lg overflow-hidden my-4" data-type="codeBlock">
      <div className="bg-gray-100 border-b-2 border-black p-2 flex justify-between items-center select-none" contentEditable={false}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 border border-black/20"></div>
          </div>
          <span className="ml-2 font-mono text-xs font-bold text-gray-500 uppercase tracking-wider">Snippet</span>
        </div>
        
        <select
          className="bg-white border-2 border-black rounded px-2 py-1 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-gray-50 focus:outline-none"
          value={node.attrs.language || 'auto'}
          onChange={(event) => {
            const val = event.target.value === 'auto' ? null : event.target.value;
            updateAttributes({ language: val });
          }}
        >
          <option value="auto">auto</option>
          <option disabled>—</option>
          {languages.map((language) => (
            <option value={language} key={language}>
              {language}
            </option>
          ))}
        </select>
      </div>
      
      <pre className="!p-4 !m-0 overflow-x-auto !bg-[#fafafa] !text-gray-700">
        {/* @ts-ignore */}
        <NodeViewContent as="code" className="font-mono text-sm block min-h-[1.5rem] !bg-transparent !text-inherit" />
      </pre>
    </NodeViewWrapper>
  );
}
