import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage auto-scrolling to the bottom of the chat list.
 * If user scrolls up (> 60px from bottom), pauses auto-scroll and flags showNewPill.
 */
export function useAutoScroll(dependency) {
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewPill, setShowNewPill] = useState(false);

  // Check scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottomNow = distanceToBottom < 60;
    setIsAtBottom(atBottomNow);
    if (atBottomNow) {
      setShowNewPill(false);
    }
  }, []);

  // Smooth or instant scroll to bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
    setIsAtBottom(true);
    setShowNewPill(false);
  }, []);

  // Trigger scroll on dependency change (new messages)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('smooth');
    } else {
      setShowNewPill(true);
    }
  }, [dependency, isAtBottom, scrollToBottom]);

  return {
    containerRef,
    isAtBottom,
    showNewPill,
    scrollToBottom,
    handleScroll,
  };
}
