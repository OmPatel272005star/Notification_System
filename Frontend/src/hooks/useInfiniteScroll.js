import { useRef, useEffect } from "react";

/**
 * Attaches an IntersectionObserver to a sentinel element.
 * Calls `callback` whenever the sentinel enters the viewport.
 *
 * @param {() => void} callback - function to call when sentinel is visible
 * @param {boolean}    enabled  - pause observation when false (e.g. no more pages)
 * @returns {React.RefObject} sentinelRef — attach to the invisible sentinel <div>
 */
export function useInfiniteScroll(callback, enabled) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callback();
      },
      { threshold: 0.1 }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [callback, enabled]);

  return sentinelRef;
}
