import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

interface TypedTextProps {
  strings: string[];
  className?: string;
}

export function TypedText({ strings, className }: TypedTextProps) {
  const el = useRef(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    const options = {
      strings: strings,
      typeSpeed: 50,
      backSpeed: 50,
      loop: true,
      cursorChar: '|',
      showCursor: true,
      cursorBlinking: true,
      smartBackspace: true,
      startDelay: 500,
      backDelay: 1000,
    };

    if (el.current) {
      typed.current = new Typed(el.current, options);
    }

    return () => {
      typed.current?.destroy();
    };
  }, [strings]);

  return (
    <span 
      ref={el} 
      className={`${className} animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}
    />
  );
}