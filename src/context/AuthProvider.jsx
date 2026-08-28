"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, getToken, setToken, clearApiCache } from "@/lib/api";

export const AuthContext = createContext(null);

const USER_FETCH_TIMEOUT_MS = 8000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Start false so login/register never wait on session restore.
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      setBootstrapped(true);
      return null;
    }

    setLoading(true);
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      setToken(null);
      setUser(null);
      setLoading(false);
      setBootstrapped(true);
    }, USER_FETCH_TIMEOUT_MS);

    try {
      const res = await authApi.user();
      if (timedOut) return null;
      setUser(res.user);
      return res.user;
    } catch {
      if (!timedOut) {
        setToken(null);
        setUser(null);
      }
      return null;
    } finally {
      clearTimeout(timeoutId);
      if (!timedOut) {
        setLoading(false);
        setBootstrapped(true);
      }
    }
  }, []);

  useEffect(() => {
    if (bootstrapped) return;
    refreshUser();
  }, [refreshUser, bootstrapped]);

  const login = useCallback(async (credentials) => {
    clearApiCache();
    const res = await authApi.login(credentials);
    const remember = credentials.remember_me !== false;
    setToken(res.token, remember);
    setUser(res.user);
    setLoading(false);
    return { user: res.user };
  }, []);

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    if (!res.requires_verification && res.token) {
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearApiCache();
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const completeVerification = useCallback((data) => {
    if (data?.token) setToken(data.token);
    if (data?.user) setUser(data.user);
    setLoading(false);
  }, []);

  const completeSocialLogin = useCallback(async (token) => {
    clearApiCache();
    setToken(token);
    setLoading(true);
    try {
      const res = await authApi.user();
      setUser(res.user);
      return res.user;
    } catch {
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      completeVerification,
      completeSocialLogin,
      refresh: refreshUser,
      getCurrentUser: () => user,
    }),
    [user, loading, login, register, logout, completeVerification, completeSocialLogin, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
