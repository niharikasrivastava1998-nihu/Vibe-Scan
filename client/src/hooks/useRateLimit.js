import { useMemo, useState } from 'react';
import { ANALYSIS_LIMIT_PER_HOUR } from '../config';

const HOUR = 60 * 60 * 1000;

export const useRateLimit = () => {
  const [timestamps, setTimestamps] = useState([]);

  const active = useMemo(
    () => timestamps.filter((ts) => Date.now() - ts < HOUR),
    [timestamps],
  );

  const usage = active.length;
  const canAnalyze = usage < ANALYSIS_LIMIT_PER_HOUR;

  const register = () => {
    setTimestamps((prev) => [...prev.filter((ts) => Date.now() - ts < HOUR), Date.now()]);
  };

  return {
    usage,
    limit: ANALYSIS_LIMIT_PER_HOUR,
    canAnalyze,
    progress: (usage / ANALYSIS_LIMIT_PER_HOUR) * 100,
    register,
  };
};
