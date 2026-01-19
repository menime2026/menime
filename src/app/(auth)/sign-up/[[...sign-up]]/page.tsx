import type { Metadata } from "next";
import { CustomSignUp } from "@/components/auth/custom-sign-up";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Sign up for Meni-me",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <CustomSignUp redirectUrl="/" signInUrl="/sign-in" />
    </div>
  );
}
