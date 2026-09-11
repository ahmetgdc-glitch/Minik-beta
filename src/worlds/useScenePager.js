import { useEffect, useRef, useState } from "react";
import { sceneIndex } from "./scenes.js";

// Native touch scrolling keeps iOS momentum and pinch zoom. Controls provide
// the same route for children who cannot swipe, keyboards and screen readers.
export function useScenePager(count, reducedMotion = false) {
  const scrollRef = useRef(null);
  const frame = useRef(null);
  const current = useRef(0);
  const [index, setIndex] = useState(0);
  const update = () => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const el = scrollRef.current;
      if (!el) return;
      current.current = sceneIndex(el.scrollLeft, el.clientWidth, count);
      setIndex(current.current);
    });
  };
  function go(next) {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(count - 1, next));
    current.current = target;
    setIndex(target);
    const calm = reducedMotion || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target * el.clientWidth, behavior: calm ? "auto" : "smooth" });
  }
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Orientation changes retain the current scene instead of stranding a
    // child halfway between two scenes, including iPad split-screen resizing.
    const resize = new ResizeObserver(() => {
      el.scrollTo({ left: current.current * el.clientWidth, behavior: "auto" });
    });
    resize.observe(el);
    return () => {
      resize.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [count]);
  function onKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    go(current.current + (event.key === "ArrowRight" ? 1 : -1));
  }
  return { scrollRef, index, go, onScroll: update, onKeyDown };
}
