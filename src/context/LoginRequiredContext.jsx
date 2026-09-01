"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";

const LoginRequiredContext = createContext(null);

export function LoginRequiredProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    redirectTo: "/",
    title: "Login required",
    message: "Please log in to continue.",
  });

  const openLoginRequired = useCallback((opts = {}) => {
    setState({
      open: true,
      redirectTo: opts.redirectTo || "/",
      title: opts.title || "Login required",
      message: opts.message || "Please log in to continue.",
    });
  }, []);

  const closeLoginRequired = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(
    () => ({ openLoginRequired, closeLoginRequired }),
    [openLoginRequired, closeLoginRequired]
  );

  return (
    <LoginRequiredContext.Provider value={value}>
      {children}
      <LoginRequiredModal
        open={state.open}
        title={state.title}
        message={state.message}
        redirectTo={state.redirectTo}
        onClose={closeLoginRequired}
      />
    </LoginRequiredContext.Provider>
  );
}

export function useLoginRequired() {
  const ctx = useContext(LoginRequiredContext);
  if (!ctx) {
    throw new Error("useLoginRequired must be used within LoginRequiredProvider");
  }
  return ctx;
}
