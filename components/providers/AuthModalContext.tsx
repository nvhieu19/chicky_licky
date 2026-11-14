"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "USER" | "ADMIN";
  avatarUrl?: string | null;
}

interface AuthModalContextType {
  isOpen: boolean;
  mode: "login" | "register";
  openModal: (mode?: "login" | "register") => void;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  setMode: (mode: "login" | "register") => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current session from /api/auth/me on mount
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMe();

    // Check if auth query parameter requested login
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth")) {
        setIsOpen(true);
        setMode("login");
      }
    }
  }, []);

  const openModal = (initialMode: "login" | "register" = "login") => {
    setMode(initialMode);
    setIsOpen(true);
  };

  const openLogin = () => openModal("login");
  const openRegister = () => openModal("register");

  const closeModal = () => {
    setIsOpen(false);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        openModal,
        openLogin,
        openRegister,
        closeModal,
        setMode,
        currentUser,
        setCurrentUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
