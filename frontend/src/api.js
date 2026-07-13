/* ------------------------------------------------------------------ */
/*  Backend API client                                                 */
/*                                                                      */
/*  Each collection (settings, subjects, pdfs, users, payments,        */
/*  reviews) is fetched from and persisted to the Spring Boot backend. */
/*  The login session stays in the browser via localStorage.           */
/*                                                                      */
/*  Failures are thrown, never swallowed: a save that cannot reach the */
/*  server must surface to the user, otherwise the UI would report     */
/*  "saved" while the change is lost on the next refresh.              */
/* ------------------------------------------------------------------ */

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SESSION_KEY = "scholars_session";

export const api = {
  async get(key) {
    if (key === "session") {
      const v = localStorage.getItem(SESSION_KEY);
      return v ? JSON.parse(v) : null;
    }
    const r = await fetch(`${API_BASE}/${key}`);
    if (r.status === 204) return null; // nothing stored yet
    if (!r.ok) throw new Error(`GET /${key} failed (HTTP ${r.status})`);
    return r.json();
  },

  async set(key, val) {
    if (key === "session") {
      if (val == null) localStorage.removeItem(SESSION_KEY);
      else localStorage.setItem(SESSION_KEY, JSON.stringify(val));
      return val;
    }
    const r = await fetch(`${API_BASE}/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(val),
    });
    if (!r.ok) throw new Error(`PUT /${key} failed (HTTP ${r.status})`);
    return val;
  },
};
