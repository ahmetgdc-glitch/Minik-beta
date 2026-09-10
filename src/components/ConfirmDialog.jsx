import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Mino } from "./Visual.jsx";
import { useModalSafety } from "../app/useModalSafety.js";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
  showMino = false,
}) {
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);
  useModalSafety(open, onCancel);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() =>
      (danger ? cancelRef.current : confirmRef.current)?.focus(),
    );
    return () => cancelAnimationFrame(id);
  }, [open, danger]);

  if (!open) return null;
  return (
    <div
      className="modal-scrim"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
    >
      <div
        className="pause-dialog confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        {showMino ? (
          <Mino />
        ) : (
          <AlertTriangle className="confirm-dialog-icon" size={44} aria-hidden="true" />
        )}
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <button
          type="button"
          ref={confirmRef}
          className={danger ? "primary danger-button" : "primary"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button type="button" ref={cancelRef} className="secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
