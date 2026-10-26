import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ children, className, titleId, close, busy = false }: { children: ReactNode; className: string; titleId: string; close: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={titleId} onCancel={e => { e.preventDefault(); if (!busy) close(); }}>{children}</dialog>;
}