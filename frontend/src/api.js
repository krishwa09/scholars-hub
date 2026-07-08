/* ------------------------------------------------------------------ */
/*  Backend API client                                                 */
/*                                                                      */
/*  Replaces the old window.storage layer. Each collection             */
/*  (settings, subjects, pdfs, users, payments) is fetched from and    */
/*  persisted to the Spring Boot backend. The login session stays in   */
/*  the browser via localStorage. If the backend is unreachable the    */
/*  client falls back to an in-memory copy so the UI still works.      */
/* ------------------------------------------------------------------ */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SESSION_KEY = "scholars_session";
const mem = {};

export const api = {
  async get(key) {
    if (key === "session") {
      const v = localStorage.getItem(SESSION_KEY);
      return v ? JSON.parse(v) : null;
    }
    try {
      const r = await fetch(`${API_BASE}/${key}`);
      if (r.status === 204) return null;
      if (!r.ok) throw new Error(`GET /${key} → ${r.status}`);
      const data = await r.json();
      mem[key] = data;
      return data;
    } catch (e) {
      console.warn(`[api] GET ${key} failed, using local fallback:`, e.message);
      return key in mem ? mem[key] : null;
    }
  },

  async set(key, val) {
    if (key === "session") {
      if (val == null) localStorage.removeItem(SESSION_KEY);
      else localStorage.setItem(SESSION_KEY, JSON.stringify(val));
      return val;
    }
    mem[key] = val;
    try {
      const r = await fetch(`${API_BASE}/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(val),
      });
      if (!r.ok) throw new Error(`PUT /${key} → ${r.status}`);
    } catch (e) {
      console.warn(`[api] PUT ${key} failed, kept locally:`, e.message);
    }
    return val;
  },
};
