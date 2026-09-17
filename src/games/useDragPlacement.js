import { useEffect, useRef, useState } from "react";
import { createDragSession } from "./dragSession.js";

export function useDragPlacement({ paused, interactionBlocked, onDragStart, onSelect, onDrop }) {
  const boardRef = useRef(null);
  const session = useRef(createDragSession());
  const owner = useRef(null);
  const suppressClick = useRef(false);
  const latest = useRef(null);
  latest.current = { paused, interactionBlocked, onDragStart, onSelect, onDrop };
  const [drag, setDrag] = useState(null);
  const blocked = () => latest.current.paused || latest.current.interactionBlocked?.();
  function release() {
    const captured = owner.current;
    owner.current = null;
    try {
      if (captured?.element.hasPointerCapture(captured.pointerId)) captured.element.releasePointerCapture(captured.pointerId);
    } catch { /* WebKit may release capture before pagehide reaches React. */ }
  }
  function clearDragSelection() {
    if (latest.current.onDragStart) latest.current.onSelect?.(null);
  }
  function cancel(pointerId) {
    if (!session.current.cancel(pointerId)) return;
    suppressClick.current = true;
    release();
    setDrag(null);
    clearDragSelection();
  }
  function dropTarget(x, y) {
    const target = document.elementFromPoint(x, y)?.closest("[data-drop-id]");
    return target && boardRef.current?.contains(target) && !target.disabled ? target.dataset.dropId : null;
  }
  function coordinates(event) {
    return { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }
  function begin(event, id) {
    if (blocked()) return;
    const accepted = session.current.begin({ ...coordinates(event), id, isPrimary: event.isPrimary, button: event.button });
    if (!accepted) return;
    suppressClick.current = false;
    latest.current.onDragStart?.(id);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
      owner.current = { element: event.currentTarget, pointerId: event.pointerId };
    } catch {
      // Tap-to-place remains available when capture is unavailable.
      session.current.cancel();
      clearDragSelection();
    }
  }
  function move(event) {
    if (blocked()) { cancel(); return; }
    const next = session.current.move(coordinates(event));
    if (next?.moved) setDrag({ ...next, over: dropTarget(next.x, next.y) });
  }
  function end(event) {
    const next = session.current.finish(coordinates(event));
    if (!next) return;
    // Pointer-driven taps and drags both produce a follow-up click in many
    // browsers. Handle the pointer gesture here and suppress that duplicate;
    // keyboard/programmatic clicks (detail === 0) still use onClick below.
    suppressClick.current = true;
    release();
    setDrag(null);
    if (blocked()) { clearDragSelection(); return; }
    if (!next.moved) {
      latest.current.onSelect?.(next.id);
      return;
    }
    const target = dropTarget(next.x, next.y);
    if (target) latest.current.onDrop(next.id, target);
    else clearDragSelection();
  }
  useEffect(() => { if (paused) cancel(); }, [paused]);
  useEffect(() => {
    const stop = () => cancel();
    const visibility = () => { if (document.hidden) stop(); };
    window.addEventListener("pagehide", stop);
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", stop);
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", visibility);
      session.current.cancel();
      release();
    };
  }, []);
  return {
    boardRef, drag,
    sourceProps: (id) => ({
      // A draggable child must own the touch gesture before pointerdown.
      // This prevents iOS Safari from converting a real drag into page scroll.
      touchAction: "none",
      onPointerDown: event => begin(event, id),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: event => cancel(event.pointerId),
      onLostPointerCapture: event => cancel(event.pointerId),
      onClick: event => {
        if (blocked()) return;
        if (event.detail !== 0 && suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        latest.current.onSelect?.(id);
      },
    }),
  };
}
