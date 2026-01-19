"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomSignIn } from "@/components/auth/custom-sign-in";
import { CustomSignUp } from "@/components/auth/custom-sign-up";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: "sign-in" | "sign-up";
}

export function AuthModal({
  open,
  onOpenChange,
  defaultView = "sign-in",
}: AuthModalProps) {
  const [view, setView] = useState<"sign-in" | "sign-up">(defaultView);

  // Reset view when modal opens
  useEffect(() => {
    if (open) {
      setView(defaultView);
    }
  }, [open, defaultView]);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {view === "sign-in" ? "Sign In" : "Sign Up"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {view === "sign-in" ? (
            <CustomSignIn
              redirectUrl="/"
              signUpUrl="#"
              onSuccess={handleSuccess}
            />
          ) : (
            <CustomSignUp
              redirectUrl="/"
              signInUrl="#"
              onSuccess={handleSuccess}
            />
          )}
        </div>

        {/* Toggle between views */}
        <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
          {view === "sign-in" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setView("sign-up")}
                className="font-semibold text-gray-900 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setView("sign-in")}
                className="font-semibold text-gray-900 hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
