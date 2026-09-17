import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface Props {
  label: string;
  tip: string;
  className?: string;
}

export default function InfoTip({ label, tip, className = '' }: Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show]);

  return (
    <span ref={ref} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="inline-flex items-center gap-1 text-ink-500 hover:text-ink-900 transition-colors"
        aria-label={`Info: ${label}`}
      >
        {label}
        <Info className="h-3 w-3 text-ink-400 hover:text-amber-500 transition-colors" />
      </button>
      {show && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg border border-ink-200 bg-white p-2.5 text-xs leading-relaxed text-ink-600 shadow-lg animate-fadeIn"
        >
          {tip}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
        </span>
      )}
    </span>
  );
}
