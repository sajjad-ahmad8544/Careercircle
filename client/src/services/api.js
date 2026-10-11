import axios from "axios";
// Same-origin by default. For split deploys set VITE_API_URL (e.g. https://my-api.onrender.com)
export const API_URL = import.meta.env.VITE_API_URL || "";
const api = axios.create({ baseURL: API_URL + "/api" });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("t");
  if (t) c.headers.Authorization = "Bearer " + t;
  return c;
});
// expired token / suspended account -> send the user back to the login screen
api.interceptors.response.use(
  (r) => r,
  (e) => {
    const s = e.response?.status,
      msg = e.response?.data?.error || "",
      isAuthCall = (e.config?.url || "").startsWith("/auth/");
    if (
      !isAuthCall &&
      localStorage.getItem("t") &&
      (s === 401 || (s === 403 && msg === "Account suspended"))
    ) {
      localStorage.removeItem("t");
      window.location.reload();
    }
    return Promise.reject(e);
  },
);
export default api;