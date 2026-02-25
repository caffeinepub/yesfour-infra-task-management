import { useState, useEffect } from 'react';

interface CountdownResult {
  formatted: string;
  isExpired: boolean;
  isUrgent: boolean; // less than 24 hours
}

export function useCountdown(deadlineNs: bigint): CountdownResult {
  const getRemaining = () => {
    const deadlineMs = Number(deadlineNs) / 1_000_000;
    const now = Date.now();
    const diff = deadlineMs - now;
    return diff;
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemaining());
    }, 60_000); // update every minute

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineNs]);

  if (remaining <= 0) {
    return { formatted: 'Overdue', isExpired: true, isUrgent: true };
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    formatted = `${minutes}m`;
  }

  const isUrgent = remaining < 24 * 60 * 60 * 1000;

  return { formatted, isExpired: false, isUrgent };
}
