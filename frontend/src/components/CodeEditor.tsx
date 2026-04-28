import { useRef } from "react";
import { Copy, Trash2 } from "lucide-react";

interface Props {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

export function CodeEditor({ code, language, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(code);
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyToClipboard}
            title="Copy code"
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            title="Clear code"
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder={`Paste your ${language} code here...`}
        className="w-full h-80 bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed placeholder-gray-600"
      />
      <div className="flex justify-end px-4 py-1.5 bg-gray-800 border-t border-gray-700">
        <span className="text-xs text-gray-500">{code.length.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
