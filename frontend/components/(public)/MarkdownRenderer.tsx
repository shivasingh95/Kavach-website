"use client";

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Requires this CSS for syntax highlighting

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none 
      prose-headings:font-bold prose-headings:text-white
      prose-a:text-kavach-cyan hover:prose-a:text-cyan-400
      prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10
      prose-code:text-kavach-cyan prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
      prose-img:rounded-xl prose-img:border prose-img:border-white/10
      marker:text-kavach-cyan"
    >
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom override to not apply inline code styles to pre code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
