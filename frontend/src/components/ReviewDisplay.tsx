import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import type { ReviewResult } from "../types";
import { Bot, Copy } from "lucide-react";

interface Props {
  result: ReviewResult;
  isStreaming?: boolean;
}

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match;

    if (isInline) {
      return (
        <code
          className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        className="rounded-lg !my-3"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    );
  },
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mt-6 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-white mt-5 mb-2 border-b border-gray-700 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1 ml-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1 ml-2">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-3">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  hr: () => <hr className="border-gray-700 my-4" />,
};

export function ReviewDisplay({ result, isStreaming = false }: Props) {
  async function copyReview() {
    await navigator.clipboard.writeText(result.review);
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-blue-400" />
          <span className="text-sm font-medium text-gray-200">AI Review</span>
          {isStreaming ? (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Streaming
            </span>
          ) : (
            <span className="text-xs text-gray-500 font-mono">{result.model}</span>
          )}
        </div>
        {!isStreaming && (
          <button
            onClick={copyReview}
            title="Copy review"
            className="text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1 text-xs"
          >
            <Copy size={13} />
            Copy
          </button>
        )}
      </div>
      <div className="p-6 prose prose-invert max-w-none overflow-auto">
        <ReactMarkdown components={markdownComponents}>
          {result.review}
        </ReactMarkdown>
      </div>
    </div>
  );
}
