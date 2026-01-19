"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AuthModal } from "@/components/auth/auth-modal";

type AuthView = "sign-in" | "sign-up";

interface AuthModalContextType {
  openModal: (view?: AuthView) => void;
  closeModal: () => void;
  isOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>("sign-in");

  const openModal = (initialView: AuthView = "sign-in") => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <AuthModal
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultView={view}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
