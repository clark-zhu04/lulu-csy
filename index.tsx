import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { initSystemInterceptor } from './utils/systemInterceptor';
import { initAppLifecycle } from './utils/appLifecycle';
import { preloadLocalAssets, scheduleIdlePreload } from './utils/preloadResources';
import { installIOSStandaloneWorkaround } from './utils/iosStandalone';
import { installViewportRepair } from './utils/viewportRepair';
import { startRuntimeHealthProbe } from './utils/runtimeHealthProbe';
import {
  captureCollectionWallDebugConsoleArgs,
  installCollectionWallDebugConsoleCapture,
} from './utils/collectionWallDebugLog';

installCollectionWallDebugConsoleCapture();


// ─────────────────────────────────────────────
// 🧪 1. GLOBAL DEBUG HOOK（最重要：必须最早）
console.log("🚀 APP BOOT START");

// 抓 JS 错误
window.addEventListener("error", (e) => {
  console.error("💥 GLOBAL ERROR:", e.message, e.error);
});

// 抓 Promise 崩溃
window.addEventListener("unhandledrejection", (e) => {
  console.error("💥 UNHANDLED PROMISE:", e.reason);
});

// 抓是否有人强制 reload（你这个最关键）
const originalReload = window.location.reload;
window.location.reload = function (...args) {
  console.trace("🚨 reload 被触发（凶手在这里）");
  console.error("reload args:", args);
  return originalReload.apply(this, args);
};

// ─────────────────────────────────────────────
// 🔇 Production log suppression（保留你的逻辑）
if (!import.meta.env.DEV) {
  const keepCollectionWallDebug =
    (level: 'log' | 'info' | 'warn' | 'debug') =>
    (...args: unknown[]) => {
      captureCollectionWallDebugConsoleArgs(level, args);
    };

  console.log = keepCollectionWallDebug('log');
  console.warn = keepCollectionWallDebug('warn');
  console.debug = keepCollectionWallDebug('debug');
  console.info = keepCollectionWallDebug('info');
  // console.error 保留
}


// ─────────────────────────────────────────────
// 🧠 2. SYSTEM INIT CHAIN（保持原顺序）
initSystemInterceptor();
initAppLifecycle();

installIOSStandaloneWorkaround();
installViewportRepair();
startRuntimeHealthProbe();

preloadLocalAssets();
scheduleIdlePreload();

console.log("🚀 INIT CHAIN DONE");


// ─────────────────────────────────────────────
// ⚛️ 3. RENDER
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

console.log("🚀 ABOUT TO MOUNT APP");

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("🚀 APP MOUNTED");