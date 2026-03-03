"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { getAccessToken } from "@/lib/api";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  userId: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    const s = connectSocket(token);

    s.on("connect", () => {
      setIsConnected(true);
    });

    s.on("disconnect", () => {
      setIsConnected(false);
      setUserId(null);
    });

    /* 🔥 Receive identity from server */
    s.on("authenticated", ({ userId }) => {
      setUserId(userId);
    });

    setSocket(s);

    return () => {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      setUserId(null);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        userId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("SocketProvider missing");
  return ctx;
}