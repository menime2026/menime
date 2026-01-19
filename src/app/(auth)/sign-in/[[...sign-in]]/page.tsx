import type { Metadata } from "next";
import { CustomSignIn } from "@/components/auth/custom-sign-in";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your Meni-me account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <CustomSignIn redirectUrl="/" signUpUrl="/sign-up" />
    </div>
  );
}
