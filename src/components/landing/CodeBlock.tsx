import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 z-10 opacity-80 hover:opacity-100 shadow-md"
        aria-label="Copy code"
        title={copied ? 'Copied!' : 'Copy code'}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          borderRadius: '0.75rem',
          padding: '1.5rem',
          fontSize: '0.875rem',
          margin: 0,
          maxWidth: '100%',
          overflow: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        wrapLines
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
