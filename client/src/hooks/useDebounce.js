import { useState, useEffect } from "react";
// returns `value` only after the user stopped changing it for `ms` (used for search boxes)
export default function useDebounce(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}