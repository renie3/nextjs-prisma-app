"use server";

import { signIn, signOut } from "@/lib/auth";

export const handleGoogleLogin = async () => {
  await signIn("google", { redirectTo: "/" });
};

export const handleGithubLogin = async () => {
  await signIn("github", { redirectTo: "/" });
};

export const handleLogout = async () => {
  await signOut({ redirectTo: "/" });
};
