import { useEffect } from 'react';

export default function Modal({ open, title, onClose, children }) {
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
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 'min(520px, 100%)',
          background: '#fff',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 12 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}