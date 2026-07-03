"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Styling lives in `.markdown-preview` (app/globals.css) so inline vs. block
// code and GFM task lists render correctly without per-element component maps.
export function MarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Mọi link mở sang tab mới.
          a({ node, ...props }) {
            void node;
            return <a {...props} target="_blank" rel="noopener noreferrer" />;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
