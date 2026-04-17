import { useState } from 'react';

import { API_BASE_URL } from '../config';

export const useEmailAnalysis = () => {
  const [loading, setLoading] = useState(false);

  const analyzeEmail = async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed email analysis');
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { loading, analyzeEmail };
};
