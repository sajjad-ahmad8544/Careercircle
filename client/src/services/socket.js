import { io } from "socket.io-client";
import { API_URL } from "./api";

export const socket = io(API_URL || undefined, { autoConnect: false });
socket.on("connect", () => socket.emit("join", localStorage.getItem("t")));
