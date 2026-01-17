// src/components/SwipeRow.jsx
import { useEffect, useRef, useState } from 'react';

export default function SwipeRow({
  rowId,
  openRowId,
  setOpenRowId,
  actions,
  actionsWidth = 140,
  children,
}) {
  const isOpen = openRowId === rowId;

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  const baseXRef = useRef(0);
  const draggingRef = useRef(false);

  // 0: 未判定 / 1: 横 / 2: 縦
  const intentRef = useRef(0);

  const [x, setX] = useState(0);
  const xRef = useRef(0);

  const [dragging, setDragging] = useState(false);

  const clamp = (v) => Math.max(-actionsWidth, Math.min(0, v));

  const snapTo = (open) => {
    const next = open ? -actionsWidth : 0;
    xRef.current = next;
    baseXRef.current = next;
    setX(next);
  };

  // openRowId の変化で必ず全開/全閉に揃える
  useEffect(() => {
    snapTo(isOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, actionsWidth]);

  const lockBodyScroll = (lock) => {
    if (lock) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  };

  const onPointerDown = (e) => {
    // 他が開いてたら閉じる
    if (openRowId && openRowId !== rowId) {
      setOpenRowId(null);
    }

    draggingRef.current = true;
    setDragging(true);

    intentRef.current = 0;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();

    baseXRef.current = xRef.current;

    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // 少し動くまで判定しない
    if (intentRef.current === 0) {
      if (absX < 6 && absY < 6) return;

      if (absX > absY * 1.2) {
        intentRef.current = 1; // 横
        lockBodyScroll(true);
      } else {
        intentRef.current = 2; // 縦
        if (isOpen) setOpenRowId(null);
        return;
      }
    }

    if (intentRef.current === 1) {
      e.preventDefault?.();
      const next = clamp(baseXRef.current + dx);
      xRef.current = next;
      setX(next);
    }
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);

    lockBodyScroll(false);

    // 横操作じゃなければ終了
    if (intentRef.current !== 1) {
      intentRef.current = 0;
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const moved = xRef.current - baseXRef.current;
    const velocity = elapsed > 0 ? moved / elapsed : 0;

    const OPEN_RATIO = 0.35;
    const CLOSE_RATIO = 0.30;

    const vOpen = -0.25;
    const vClose = 0.30;

    if (!isOpen) {
      const shouldOpen = velocity < vOpen || xRef.current <= -actionsWidth * OPEN_RATIO;
      if (shouldOpen) {
        setOpenRowId(rowId);
        snapTo(true);
      } else {
        setOpenRowId(null);
        snapTo(false);
      }
    } else {
      const shouldClose = velocity > vClose || xRef.current > -actionsWidth * (1 - CLOSE_RATIO);
      if (shouldClose) {
        setOpenRowId(null);
        snapTo(false);
      } else {
        setOpenRowId(rowId);
        snapTo(true);
      }
    }

    intentRef.current = 0;
  };

  // 開いてる時にタップしたら閉じる（ドラッグじゃない時）
  const onClickFront = () => {
    if (!isOpen) return;
    if (dragging) return;
    setOpenRowId(null);
    snapTo(false);
  };

  return (
    <div className={`swipeWrap ${isOpen ? 'isOpen' : ''}`}>
      <div className="swipeBack" style={{ width: actionsWidth }}>
        {actions}
      </div>

      <div
        className={`swipeFront ${dragging ? 'isDragging' : ''}`}
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClickFront}
      >
        {children}
      </div>
    </div>
  );
}