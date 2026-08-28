"use client";

import { useAuthContext } from "@/context/AuthProvider";
import { useSnackbar } from "@/context/SnackbarContext";
import { useFcm } from "@/hooks/useFcm";

/**
 * Registers FCM when user is logged in: request permission, get token, POST to backend.
 * Shows in-app toast (info) for foreground push messages.
 */
export default function FcmProvider({ children }) {
  const { isAuthenticated } = useAuthContext();
  const { showInfo } = useSnackbar();

  const handleForegroundMessage = (title, body) => {
    const message = body ? `${title}: ${body}` : title;
    showInfo(message);
  };

  useFcm(isAuthenticated, handleForegroundMessage);

  return children;
}
