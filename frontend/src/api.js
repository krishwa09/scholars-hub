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

/* ------------------------------------------------------------------ */
/*  Auth: OTP-verified sign-up and password reset                      */
/*  Each call resolves to { ok, msg?, devCode?, user? }. A non-ok body */
/*  is returned as-is so the UI can show the server's message.         */
/* ------------------------------------------------------------------ */
async function post(path, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data;
  try {
    data = await r.json();
  } catch {
    throw new Error(`Server error (HTTP ${r.status}). Is the backend running?`);
  }
  return data;
}

export const authApi = {
  // sign-up: request a code, then verify it to create the account
  registerRequest: (name, email, password) => post("/auth/register/request", { name, email, password }),
  registerVerify: (email, code) => post("/auth/register/verify", { email, code }),

  // forgot password: request a code, then verify it to set a new password
  forgotRequest: (email) => post("/auth/password/forgot", { email }),
  resetPassword: (email, code, newPassword) => post("/auth/password/reset", { email, code, newPassword }),
};
