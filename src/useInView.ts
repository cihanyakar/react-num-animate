import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type UseInViewOptions = {
  /** Margin around the root element passed to `IntersectionObserver`. Defaults to `"0px"`. */
  rootMargin?: string;
  /** Visibility threshold (0..1) or array of thresholds. Defaults to `0.1`. */
  threshold?: number | number[];
  /** Stop observing after the element first enters the viewport. Defaults to true. */
  once?: boolean;
};

/**
 * Native `IntersectionObserver` wrapper. Returns a tuple of `[ref, inView]`.
 * Attach the ref to any element and read `inView` to gate effects on visibility.
 *
 * Falls back to `inView: true` in environments without `IntersectionObserver`
 * (notably during SSR).
 */
export function useInView<T extends Element = HTMLElement>(
  options: UseInViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { rootMargin = "0px", threshold = 0.1, once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      setInView(true);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);

        if (visible) {
          setInView(true);

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, once]);

  return [ref, inView];
}
