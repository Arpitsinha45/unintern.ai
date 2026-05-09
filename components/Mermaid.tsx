import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
});

export const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.render('mermaid-svg-' + Math.random().toString(36).substring(7), chart).then((result) => {
        if (ref.current) {
          ref.current.innerHTML = result.svg;
        }
      }).catch((e) => {
        console.error('Mermaid render error', e);
      });
    }
  }, [chart]);

  return <div ref={ref} className="flex justify-center my-4 overflow-x-auto" />;
};
