"use client";

import useAuth from "@/hooks/useAuth";
import { useLoginRequired } from "@/context/LoginRequiredContext";

/**
 * Returns a function that opens the login modal when the user is a guest.
 * @returns {(opts?: { redirectTo?: string, title?: string, message?: string }) => boolean}
 *   `true` if authenticated (caller may continue), `false` if modal was shown.
 */
export default function useRequireLogin() {
  const { isAuthenticated, loading } = useAuth();
  const { openLoginRequired } = useLoginRequired();

  return (opts = {}) => {
    if (loading) return false;
    if (isAuthenticated) return true;
    openLoginRequired({
      redirectTo: opts.redirectTo || "/",
      title: opts.title || "Login required",
      message: opts.message || "Please log in to continue.",
    });
    return false;
  };
}
