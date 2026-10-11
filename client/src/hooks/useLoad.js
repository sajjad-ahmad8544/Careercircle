import { useState, useEffect } from "react";
import api from "../services/api";

// const [data, reload, setData] = useLoad('/url', [deps])
export default function useLoad(url, deps = []) {
  const [d, set] = useState(null);
  const load = () => api.get(url).then((r) => set(r.data));
  useEffect(() => {
    load();
  }, deps);
  return [d, load, set];
}
