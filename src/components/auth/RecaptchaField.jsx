"use client";

import { useEffect, useId, useRef } from "react";

let scriptLoading = null;

function loadRecaptchaScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.render) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-recaptcha="v2"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      if (window.grecaptcha?.render) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "v2";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

/**
 * Google reCAPTCHA v2 checkbox. Calls onChange with the response token (or "").
 */
export default function RecaptchaField({ siteKey, onChange, className = "" }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const reactId = useId().replace(/:/g, "");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;
    let cancelled = false;

    loadRecaptchaScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.grecaptcha) return;

        const ready = () => {
          if (cancelled || widgetIdRef.current != null) return;
          try {
            containerRef.current.innerHTML = "";
            widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
              sitekey: siteKey,
              callback: (token) => onChangeRef.current?.(token || ""),
              "expired-callback": () => onChangeRef.current?.(""),
              "error-callback": () => onChangeRef.current?.(""),
            });
          } catch (err) {
            // Already rendered in this container
            console.warn("reCAPTCHA render:", err?.message || err);
          }
        };

        if (window.grecaptcha.render) {
          ready();
        } else if (typeof window.grecaptcha.ready === "function") {
          window.grecaptcha.ready(ready);
        } else {
          ready();
        }
      })
      .catch(() => {
        onChangeRef.current?.("");
      });

    return () => {
      cancelled = true;
      widgetIdRef.current = null;
      onChangeRef.current?.("");
    };
  }, [siteKey, reactId]);

  if (!siteKey) return null;

  return (
    <div className={className}>
      <div ref={containerRef} id={`recaptcha-${reactId}`} />
    </div>
  );
}

/** Reset the widget after a failed submit so the user can retry. */
export function resetRecaptcha() {
  if (typeof window === "undefined" || !window.grecaptcha?.reset) return;
  try {
    window.grecaptcha.reset();
  } catch {
    /* ignore */
  }
}
