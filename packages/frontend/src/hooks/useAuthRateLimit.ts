import { useState, useEffect } from 'react';

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
}

const STORAGE_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 3;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

// Helper to get initial state from localStorage
const getInitialState = (): RateLimitState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { attempts: 0, lockedUntil: null };
  }

  try {
    const parsed = JSON.parse(stored) as RateLimitState;
    // Check if lock has expired
    if (parsed.lockedUntil && Date.now() >= parsed.lockedUntil) {
      localStorage.removeItem(STORAGE_KEY);
      return { attempts: 0, lockedUntil: null };
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { attempts: 0, lockedUntil: null };
  }
};

export const useAuthRateLimit = () => {
  const [state, setState] = useState<RateLimitState>(getInitialState);
  const [canAttempt, setCanAttempt] = useState(() => {
    const initial = getInitialState();
    return !initial.lockedUntil || Date.now() >= initial.lockedUntil;
  });

  // Update canAttempt based on current time and lock status
  useEffect(() => {
    const updateCanAttempt = () => {
      if (!state.lockedUntil) {
        setCanAttempt(true);
      } else {
        const now = Date.now();
        const canNowAttempt = now >= state.lockedUntil;
        setCanAttempt(canNowAttempt);
        
        // Clear lock if expired
        if (canNowAttempt) {
          setState({ attempts: 0, lockedUntil: null });
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };

    // Update immediately
    updateCanAttempt();

    // Update every second to keep UI in sync
    const interval = setInterval(updateCanAttempt, 1000);
    return () => clearInterval(interval);
  }, [state.lockedUntil]);

  const recordAttempt = (success: boolean) => {
    if (success) {
      // Clear on success
      setState({ attempts: 0, lockedUntil: null });
      localStorage.removeItem(STORAGE_KEY);
      setCanAttempt(true);
    } else {
      // Increment attempts on failure
      const newAttempts = state.attempts + 1;
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCK_DURATION;
        const newState = { attempts: newAttempts, lockedUntil: lockTime };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        setCanAttempt(false);
      } else {
        const newState = { attempts: newAttempts, lockedUntil: null };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
    }
  };

  const getRemainingTime = (): number => {
    if (!state.lockedUntil) return 0;
    const remaining = Math.ceil((state.lockedUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const formatRemainingTime = (): string => {
    const seconds = getRemainingTime();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    canAttempt,
    recordAttempt,
    getRemainingTime,
    formatRemainingTime,
    attemptsLeft: MAX_ATTEMPTS - state.attempts,
  };
};

