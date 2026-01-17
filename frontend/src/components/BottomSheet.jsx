// src/components/BottomSheet.jsx
import { useEffect } from 'react';

export default function BottomSheet({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="sheetOverlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="sheetPanel">
        <div className="sheetHeader">
          <div className="sheetTitle">{title}</div>
          <button type="button" className="sheetClose" onClick={onClose}>
            閉じる
          </button>
        </div>
        <div className="sheetBody">{children}</div>
      </div>
    </div>
  );
}