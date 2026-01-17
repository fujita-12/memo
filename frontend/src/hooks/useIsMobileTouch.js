// src/hooks/useIsMobileTouch.js
import { useEffect, useState } from 'react';

export function useIsMobileTouch() {
  const [isMobileTouch, setIsMobileTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setIsMobileTouch(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return isMobileTouch;
}