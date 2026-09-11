import React from "react";
import { createPortal } from "react-dom";
import Visual from "../components/Visual.jsx";

export default function DragPreview({ drag, items, lang, settings }) {
  if (!drag) return null;
  // Keep viewport coordinates correct even when the game celebrates with a
  // transform or is inside a scrolling container.
  return createPortal(<div className="drag-ghost" aria-hidden="true" style={{ left: drag.x, top: drag.y }}>
    <Visual item={items.find(item => item.id === drag.id)} lang={lang} photos={settings.photos} />
  </div>, document.body);
}
