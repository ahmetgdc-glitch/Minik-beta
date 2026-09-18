export const DRAW_HISTORY_LIMIT = 8;
export const MIN_STROKE_DISTANCE = 14;

export function isMeaningfulStroke(distance, minimum = MIN_STROKE_DISTANCE) {
  return Number.isFinite(distance) && distance >= minimum;
}

export function drawingHistoryEntry(snapshot, strokes = 0) {
  if (!snapshot) return null;
  return {
    snapshot,
    strokes: Number.isFinite(strokes) ? Math.max(0, Math.floor(strokes)) : 0,
  };
}

export function drawingHistoryState(entry, fallbackStrokes = 0) {
  if (typeof entry === "string") {
    return { snapshot: entry, strokes: Math.max(0, Math.floor(fallbackStrokes || 0)) };
  }
  if (!entry?.snapshot) return null;
  return {
    snapshot: entry.snapshot,
    strokes: Number.isFinite(entry.strokes) ? Math.max(0, Math.floor(entry.strokes)) : Math.max(0, Math.floor(fallbackStrokes || 0)),
  };
}

export function pushDrawingHistory(history, snapshot, limit = DRAW_HISTORY_LIMIT) {
  const list = Array.isArray(history) ? history : [];
  if (!snapshot) return list.slice(-limit);
  return [...list, snapshot].slice(-limit);
}
