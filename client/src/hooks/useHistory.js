import { useEffect, useState } from 'react';

export const useHistory = (key, limit = 10) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    setItems(raw ? JSON.parse(raw) : []);
  }, [key]);

  const push = (value) => {
    const next = [value, ...items].slice(0, limit);
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const clear = () => {
    setItems([]);
    localStorage.removeItem(key);
  };

  return { items, push, clear };
};
