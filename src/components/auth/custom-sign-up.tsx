"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Eye, EyeOff, AlertCircle, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LAST_AUTH_METHOD_KEY = "clerk_last_auth_method";

type AuthMethod = "email" | "google";

const getLastAuthMethod = (): AuthMethod | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_AUTH_METHOD_KEY) as AuthMethod | null;
};

const setLastAuthMethod = (method: AuthMethod) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_AUTH_METHOD_KEY, method);
};

type CustomSignUpProps = {
  redirectUrl?: string;
  signInUrl?: string;
  onSuccess?: () => void;
};

export function CustomSignUp({
  redirectUrl = "/",
  signInUrl = "/sign-in",
  onSuccess,
}: CustomSignUpProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [lastMethod, setLastMethod] = useState<AuthMethod | null>(null);

  // Load last auth method on mount
  useState(() => {
    setLastMethod(getLastAuthMethod());
  });

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setError(null);
    setIsLoading(true);

    try {
      // Split name into first and last
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      console.error("Sign-up error:", err);
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(
        clerkError.errors?.[0]?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        setLastAuthMethod("email");
        await setActive({ session: result.createdSessionId });
        onSuccess?.();
        router.push(redirectUrl);
      } else {
        console.log("Verification status:", result.status);
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(
        clerkError.errors?.[0]?.message ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;

    setError(null);
    setIsGoogleLoading(true);

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: redirectUrl,
      });
      setLastAuthMethod("google");
    } catch (err: unknown) {
      console.error("Google sign-up error:", err);
      const clerkError = err as { errors?: Array<{ message: string }> };
      setError(
        clerkError.errors?.[0]?.message ||
          "Unable to sign up with Google. Please try again."
      );
      setIsGoogleLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Verification Step
  if (pendingVerification) {
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Verify your email
          </h1>
          <p className="text-sm text-gray-500">
            We sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerification} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="text-xs font-bold uppercase tracking-wider text-gray-500"
            >
              Verification Code
            </label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              className="h-12 text-center text-lg tracking-widest border-gray-200 focus:border-gray-900 focus:ring-0"
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold uppercase tracking-wider"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setPendingVerification(false)}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to sign up
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Create an account
        </h1>
        <p className="text-sm text-gray-500">
          Join us and start shopping today
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Sign-Up */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
          className={cn(
            "relative w-full h-12 border-gray-200 hover:bg-gray-50",
            lastMethod === "google" && "ring-2 ring-gray-900 ring-offset-2"
          )}
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
              {lastMethod === "google" && (
                <span className="absolute right-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  Last used
                </span>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-wider text-gray-500"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 pl-10 border-gray-200 focus:border-gray-900 focus:ring-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-gray-500"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                "h-12 pl-10 border-gray-200 focus:border-gray-900 focus:ring-0",
                lastMethod === "email" && "ring-2 ring-gray-900 ring-offset-2"
              )}
            />
            {lastMethod === "email" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Last used
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wider text-gray-500"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 pr-10 border-gray-200 focus:border-gray-900 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400">Minimum 8 characters</p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold uppercase tracking-wider"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href={signInUrl}
          className="font-semibold text-gray-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
