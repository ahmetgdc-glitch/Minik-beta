// A single pointer owns a placement. DOM capture and hit testing live in the
// hook; these rules also cover queued pointer events after a pause/cancel.
export function createDragSession(threshold = 10) {
  let active = null;
  return {
    begin({ pointerId, id, x, y, isPrimary = true, button = 0 }) {
      if (active || !isPrimary || button !== 0 || !id || !Number.isFinite(x) || !Number.isFinite(y)) return false;
      active = { pointerId, id, startX: x, startY: y, x, y, moved: false };
      return true;
    },
    move({ pointerId, x, y }) {
      if (!active || active.pointerId !== pointerId || !Number.isFinite(x) || !Number.isFinite(y)) return null;
      active.x = x;
      active.y = y;
      active.moved ||= Math.hypot(x - active.startX, y - active.startY) >= threshold;
      return { ...active };
    },
    finish(event) {
      const result = this.move(event);
      if (result) active = null;
      return result;
    },
    cancel(pointerId) {
      if (!active || (pointerId !== undefined && active.pointerId !== pointerId)) return false;
      active = null;
      return true;
    },
  };
}

export function placePair(matched, source, target, allowedIds) {
  if (!allowedIds.includes(source) || !allowedIds.includes(target) || matched.includes(source) || matched.includes(target)) return { matched, outcome: "ignore" };
  return source === target ? { matched: [...matched, source], outcome: "match" } : { matched, outcome: "retry" };
}
