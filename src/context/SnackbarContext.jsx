"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const noop = () => {};

let externalHandlers = {
  showSuccess: noop,
  showError: noop,
  showValidationErrors: noop,
};

export const snackbarBus = {
  showSuccess: (message) => externalHandlers.showSuccess?.(message),
  showError: (message) => externalHandlers.showError?.(message),
  showValidationErrors: (errors) => externalHandlers.showValidationErrors?.(errors),
};

export const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState(null);

  const showSnackbar = useCallback((type, message, validationErrors = null) => {
    setSnackbar({
      type,
      message,
      validationErrors,
      visible: true,
      timestamp: Date.now(),
    });
  }, []);

  const showSuccess = useCallback((message) => showSnackbar("success", message), [showSnackbar]);
  const showError = useCallback((message) => showSnackbar("error", message), [showSnackbar]);
  const showInfo = useCallback((message) => showSnackbar("info", message), [showSnackbar]);
  const showValidationErrors = useCallback(
    (errors) => {
      const list =
        (errors && Object.values(errors || {}).flat()) || (Array.isArray(errors) ? errors : []);
      showSnackbar("error", list[0] || "Validation failed.", list);
    },
    [showSnackbar]
  );

  const hide = useCallback(() => {
    setSnackbar((prev) => (prev ? { ...prev, visible: false } : null));
  }, []);

  useEffect(() => {
    externalHandlers = { showSuccess, showError, showValidationErrors };
    return () => {
      externalHandlers = { showSuccess: noop, showError: noop, showValidationErrors: noop };
    };
  }, [showSuccess, showError, showValidationErrors]);

  useEffect(() => {
    if (!snackbar?.visible) return;
    const duration = snackbar?.type === "success" ? 2500 : 3500;
    const timer = setTimeout(() => {
      setSnackbar((prev) => (prev ? { ...prev, visible: false } : null));
    }, duration);
    return () => clearTimeout(timer);
  }, [snackbar?.timestamp, snackbar?.type]);

  const value = useMemo(
    () => ({
      snackbar,
      showSuccess,
      showError,
      showInfo,
      showValidationErrors,
      hide,
    }),
    [snackbar, showSuccess, showError, showInfo, showValidationErrors, hide]
  );

  return <SnackbarContext.Provider value={value}>{children}</SnackbarContext.Provider>;
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error("useSnackbar must be used within SnackbarProvider");
  return context;
};
