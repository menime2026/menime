"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AuthModal } from "./auth-modal";

export function DelayedLoginPopup() {
  const { isSignedIn, isLoaded } = useUser();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // Don't show popup if user is already signed in
    if (isSignedIn) {
      setShowPopup(false);
      return;
    }

    // Check if popup was already dismissed in this session
    const dismissed = sessionStorage.getItem("login-popup-dismissed");
    if (dismissed) return;

    // Show popup after 30 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded]);

  const handleClose = () => {
    setShowPopup(false);
    sessionStorage.setItem("login-popup-dismissed", "true");
  };

  if (!showPopup) return null;

  return <AuthModal open={showPopup} onOpenChange={handleClose} />;
}
