export const DRAW_HISTORY_LIMIT = 8;
export const MIN_STROKE_DISTANCE = 14;

export function isMeaningfulStroke(distance, minimum = MIN_STROKE_DISTANCE) {
  return Number.isFinite(distance) && distance >= minimum;
}

export function pushDrawingHistory(history, snapshot, limit = DRAW_HISTORY_LIMIT) {
  const list = Array.isArray(history) ? history : [];
  if (!snapshot) return list.slice(-limit);
  return [...list, snapshot].slice(-limit);
}
