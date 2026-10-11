import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { socket } from "../services/socket";

export const Ctx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("t")) return setReady(true);
    api
      .get("/me")
      .then((r) => setUser(r.data))
      .catch((e) => e.response?.status === 401 && localStorage.removeItem("t"))
      .finally(() => setReady(true));
  }, []);
  const logout = () => {
    localStorage.removeItem("t");
    socket.disconnect();
    setUser(null);
  };
  return (
    <Ctx.Provider value={{ user, setUser, ready, logout }}>
      {children}
    </Ctx.Provider>
  );
}