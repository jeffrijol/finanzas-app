import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SessionTimeoutOptions {
  warningTime?: number; // Minutes before expiry to show warning (default: 5)
}

export const useSessionTimeout = (options: SessionTimeoutOptions = {}) => {
  const { warningTime = 5 } = options;
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setShowWarning(false);
        return;
      }

      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const warningThreshold = warningTime * 60 * 1000;

      if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeLeft(Math.floor(timeUntilExpiry / 1000));
      } else {
        setShowWarning(false);
        setTimeLeft(0);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [warningTime]);

  // Update countdown every second when warning is shown
  useEffect(() => {
    if (!showWarning || timeLeft <= 0) return;

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showWarning, timeLeft]);

  const formatTime = (): string => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setShowWarning(false);
      setTimeLeft(0);
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  };

  return {
    showWarning,
    timeLeft,
    formatTime,
    refreshSession,
  };
};
