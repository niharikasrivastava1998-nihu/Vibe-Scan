import { useState } from 'react';

const API = 'http://localhost:3001';

export const usePostAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async ({ platform, text }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/analyze/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, analyze };
};
