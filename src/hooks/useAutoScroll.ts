import { useEffect, useRef } from "react";

const EDGE_THRESHOLD = 150; // Distance from edge to trigger scroll (px)
const MAX_SCROLL_SPEED = 15; // Maximum scroll speed (px/frame)

const calculateScrollSpeed = (distanceFromEdge: number): number => {
  const ratio = 1 - distanceFromEdge / EDGE_THRESHOLD;
  return ratio * MAX_SCROLL_SPEED;
};

export const useAutoScroll = (
  scrollContainerRef: React.RefObject<HTMLElement>,
  isDragging: boolean,
) => {
  const animationFrameRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging || !scrollContainerRef.current) {
      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const scroll = () => {
      if (!scrollContainerRef.current) return;

      const { x } = mousePositionRef.current;
      const leftEdge = containerRect.left;
      const rightEdge = containerRect.right;

      // Calculate distances from edges
      const distanceFromLeft = x - leftEdge;
      const distanceFromRight = rightEdge - x;

      let scrollAmount = 0;

      // Scroll left when near left edge
      if (distanceFromLeft < EDGE_THRESHOLD && distanceFromLeft > 0) {
        const speed = calculateScrollSpeed(distanceFromLeft);
        scrollAmount = -speed;
      }

      // Scroll right when near right edge
      if (distanceFromRight < EDGE_THRESHOLD && distanceFromRight > 0) {
        const speed = calculateScrollSpeed(distanceFromRight);
        scrollAmount = speed;
      }

      // Apply scroll with boundary checks
      if (scrollAmount !== 0) {
        const newScrollLeft = container.scrollLeft + scrollAmount;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        // Clamp scroll position to valid range
        container.scrollLeft = Math.max(
          0,
          Math.min(newScrollLeft, maxScrollLeft),
        );
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    // Start listening
    document.addEventListener("mousemove", handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(scroll);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isDragging, scrollContainerRef]);
};
