
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormattedContentProps {
    content: string;
}

export function FormattedContent({ content }: FormattedContentProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, className, children, ...props }) {
                    const [isCopied, setIsCopied] = useState(false);
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    const handleCopy = () => {
                        navigator.clipboard.writeText(codeString).then(() => {
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                        });
                    };

                    return match ? (
                        <div className="relative group/code-block">
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {codeString}
                            </SyntaxHighlighter>
                             <Button
                                onClick={handleCopy}
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover/code-block:opacity-100 transition-opacity"
                                aria-label="Kopier kode"
                            >
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    ) : (
                        <code className={cn("not-prose", className)} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
