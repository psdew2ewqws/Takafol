"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaProvider() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Auto-update service worker
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "activated" &&
                  navigator.serviceWorker.controller
                ) {
                  // New version available - could show update prompt
                }
              });
            }
          });
        })
        .catch(() => {
          // SW registration failed silently
        });
    }

    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    setIsStandalone(standalone);

    // Check iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIos(ios);

    // Listen for install prompt (Chrome/Edge/Samsung)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay if not already installed
      if (!standalone) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show iOS banner if not installed
    if (ios && !standalone) {
      const dismissed = localStorage.getItem("pwa-ios-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShowBanner(false);
        setInstallPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (isIos) {
      localStorage.setItem("pwa-ios-dismissed", "true");
    }
  };

  // Don't show if already installed or banner dismissed
  if (isStandalone || !showBanner) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300"
      role="alert"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 512 512" className="w-8 h-8">
            <path
              d="M256 380 C210 340 165 295 165 248 C165 215 188 192 220 192 C237 192 252 200 260 213 C268 200 283 192 300 192 C332 192 355 215 355 248 C355 295 310 340 256 380Z"
              fill="#FBBF24"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">
            حمّل تطبيق تكافل
          </p>

          {isIos ? (
            <p className="text-xs text-gray-500 mt-0.5">
              اضغط على{" "}
              <span className="inline-flex items-center">
                <svg
                  className="w-4 h-4 inline text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </span>{" "}
              ثم &quot;إضافة إلى الشاشة الرئيسية&quot;
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-0.5">
              أضف التطبيق للشاشة الرئيسية للوصول السريع
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-2">
            {!isIos && (
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded-lg hover:bg-emerald-800 transition-colors"
              >
                تحميل
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              لاحقاً
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="إغلاق"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
