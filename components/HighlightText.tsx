import React from 'react';

interface HighlightTextProps {
  text: string;
  highlights: { phrase: string; category: 'danger' | 'warning'; reason: string }[];
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, highlights }) => {
  if (!highlights || highlights.length === 0) {
    return <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">{text}</div>;
  }

  // Create a regex pattern from all phrases, escaping special characters
  const pattern = new RegExp(`(${highlights.map(h => h.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  
  const parts = text.split(pattern);

  return (
    <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
      {parts.map((part, i) => {
        const match = highlights.find(h => h.phrase.toLowerCase() === part.toLowerCase());
        
        if (match) {
          const colorClass = match.category === 'danger' 
            ? 'bg-red-100 text-red-800 border-b-2 border-red-400' 
            : 'bg-yellow-100 text-yellow-800 border-b-2 border-yellow-400';

          return (
            <span key={i} className={`relative group cursor-help px-0.5 rounded ${colorClass}`}>
              {part}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-10">
                {match.reason}
                <svg className="absolute text-slate-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
              </span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};