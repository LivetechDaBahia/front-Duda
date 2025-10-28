import { useState, useEffect, useRef } from "react";

interface UseCountdownReturn {
  seconds: number;
  isRunning: boolean;
  start: (initialSeconds: number) => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Reusable countdown timer hook
 * Automatically decrements every second and stops at 0
 */
export function useCountdown(): UseCountdownReturn {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds]);

  const start = (initialSeconds: number) => {
    setSeconds(initialSeconds);
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  return { seconds, isRunning, start, stop, reset };
}
