/* Small helpers shared by every module. */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const inr = (n) => '\u20B9' + Number(n).toLocaleString('en-IN');
/* localStorage can fail (private mode, full disk), so always wrap it. */
export const load = (k, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? fallback : v; } catch { return fallback; }
};
export const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
