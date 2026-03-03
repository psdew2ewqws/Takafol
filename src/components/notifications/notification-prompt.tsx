"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { motion, AnimatePresence } from "motion/react";

const COOLDOWN_KEY = "takafol-notif-dismissed";
const SUBSCRIBED_KEY = "takafol-notif-subscribed";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

type PromptState = "idle" | "prompt" | "success" | "denied" | "unsupported";

export function NotificationPrompt() {
  const { t } = useLanguage();
  const [state, setState] = useState<PromptState>("idle");

  useEffect(() => {
    // Don't show on server or if notifications aren't supported
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    // Already subscribed
    if (localStorage.getItem(SUBSCRIBED_KEY) === "true") return;

    // Already granted permission
    if (Notification.permission === "granted") {
      localStorage.setItem(SUBSCRIBED_KEY, "true");
      return;
    }

    // Check cooldown
    const dismissed = localStorage.getItem(COOLDOWN_KEY);
    if (dismissed) {
      const elapsed = Date.now() - parseInt(dismissed, 10);
      if (elapsed < COOLDOWN_MS) return;
    }

    // Show prompt after short delay
    const timer = setTimeout(() => setState("prompt"), 1500);
    return () => clearTimeout(timer);
  }, []);

  const subscribe = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        setState("denied");
        return;
      }

      if (permission !== "granted") {
        handleDismiss();
        return;
      }

      // Get service worker registration
      const reg = await navigator.serviceWorker.ready;

      // Subscribe to push
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("VAPID public key not configured");
        setState("denied");
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      // Send subscription to backend
      const sub = subscription.toJSON();
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys?.p256dh,
            auth: sub.keys?.auth,
          },
          userAgent: navigator.userAgent,
        }),
      });

      localStorage.setItem(SUBSCRIBED_KEY, "true");
      localStorage.removeItem(COOLDOWN_KEY);
      setState("success");

      // Auto-close after 3 seconds
      setTimeout(() => setState("idle"), 3000);
    } catch (err) {
      console.error("Push subscription failed:", err);
      setState("denied");
    }
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
    setState("idle");
  }, []);

  if (state === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={state === "prompt" ? handleDismiss : undefined}
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-gradient-to-b from-emerald-900 via-emerald-950 to-gray-950 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Gold decorative top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

            {/* Mosque silhouette */}
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent" />
              <svg
                viewBox="0 0 400 120"
                className="absolute bottom-0 w-full text-emerald-800/50"
                fill="currentColor"
              >
                {/* Mosque silhouette */}
                <path d="M0,120 L0,90 L30,90 L30,70 L40,40 L50,70 L50,90 L80,90 L80,75 L90,50 L95,35 L100,50 L110,75 L110,90 L140,90 L140,80 L150,55 L155,30 L157,20 L159,30 L165,55 L175,80 L175,90 L200,90 L200,65 L210,40 L215,25 L217,15 L219,25 L225,40 L235,65 L235,90 L265,90 L265,80 L275,55 L280,30 L282,20 L284,30 L290,55 L300,80 L300,90 L330,90 L330,75 L340,50 L345,35 L350,50 L360,75 L360,90 L400,90 L400,120 Z" />
                {/* Stars */}
                <circle cx="50" cy="25" r="1.5" fill="#FBBF24" opacity="0.6" />
                <circle cx="120" cy="15" r="1" fill="#FBBF24" opacity="0.4" />
                <circle cx="300" cy="10" r="1.5" fill="#FBBF24" opacity="0.5" />
                <circle cx="350" cy="20" r="1" fill="#FBBF24" opacity="0.3" />
                {/* Crescent */}
                <g transform="translate(200, 8)">
                  <circle cx="0" cy="0" r="5" fill="#FBBF24" opacity="0.8" />
                  <circle cx="2" cy="-1" r="4" fill="#064E3B" />
                </g>
              </svg>
              {/* Trophy icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.5 3.5v-2h9v2h3a1 1 0 011 1v3a4 4 0 01-3.5 3.97A5.002 5.002 0 0113 14.92V17h2a3 3 0 013 3v1H6v-1a3 3 0 013-3h2v-2.08A5.002 5.002 0 017 11.47 4 4 0 013.5 7.5v-3a1 1 0 011-1h3zm0 2h-2v2a2 2 0 001.5 1.94V5.5zm9 3.94A2 2 0 0018 7.5v-2h-2v3.94zM9.5 3.5v7a2.5 2.5 0 005 0v-7h-5z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 text-center">
              {state === "prompt" && (
                <>
                  <h2 className="text-xl font-bold text-amber-400 mb-2">
                    {t("challengePromptTitle")}
                  </h2>
                  <p className="text-sm text-emerald-100/80 mb-6 leading-relaxed">
                    {t("challengePromptDesc")}
                  </p>

                  <button
                    onClick={subscribe}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-emerald-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.98] transition-all"
                  >
                    {t("challengeJoin")}
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="w-full mt-3 py-2.5 text-emerald-300/70 text-sm font-medium hover:text-emerald-200 transition-colors"
                  >
                    {t("challengeLater")}
                  </button>
                </>
              )}

              {state === "success" && (
                <div className="py-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-emerald-400 mb-1">
                    {t("challengeJoined")}
                  </h2>
                  <p className="text-sm text-emerald-100/60">
                    {t("challengeJoinedDesc")}
                  </p>
                </div>
              )}

              {state === "denied" && (
                <div className="py-4">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-amber-400 mb-1">
                    {t("challengeDeniedTitle")}
                  </h2>
                  <p className="text-sm text-emerald-100/60 mb-4">
                    {t("challengeDeniedDesc")}
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="px-6 py-2 bg-emerald-800 text-emerald-200 text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    {t("challengeOk")}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
